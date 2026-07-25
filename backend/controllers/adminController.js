const User = require('../models/User');
const Department = require('../models/Department');
const logActivity = require('../utils/logger');
const transporter = require('../config/nodemailer');

// @desc    Get all pending employee registration requests
// @route   GET /api/admin/pending-users
// @access  Private (Super Admin, HR Admin)
exports.getPendingUsers = async (req, res, next) => {
  try {
    const { search, department, sort } = req.query;

    const query = { status: 'Pending' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department = department;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'name') sortOption = { name: 1 };

    const pendingUsers = await User.find(query)
      .populate('department', 'name')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      pendingUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve employee registration request
// @route   PUT /api/admin/approve/:id
// @access  Private (Super Admin, HR Admin)
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.status === 'Active' && user.isApproved) {
      return res.status(400).json({ success: false, message: 'User account is already active and approved' });
    }

    user.status = 'Active';
    user.isApproved = true;
    user.emailVerified = true; // Auto verify on admin approval
    user.rejectionReason = null;
    await user.save();

    // Increment department employee count if assigned
    if (user.department) {
      await Department.findByIdAndUpdate(user.department, { $inc: { employeesCount: 1 } });
    }

    // Send Approval & Welcome Email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 40px; color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 28px; font-weight: 900; color: #2563eb;">ZenFlow</span>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Where Teams Work Better</p>
            </div>
            <h2 style="color: #22c55e; font-size: 20px; margin-bottom: 12px;">🎉 Welcome to ZenFlow! Account Approved</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Great news! Your employee registration request (ID: <strong>${user.employeeId}</strong>) has been approved by HR Admin.</p>
            <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #334155;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">Your Account Credentials</p>
              <p style="color: #ffffff; font-size: 14px; margin: 4px 0;">Email: <strong>${user.email}</strong></p>
              <p style="color: #ffffff; font-size: 14px; margin: 4px 0;">Role: <strong>${user.role}</strong></p>
              <p style="color: #ffffff; font-size: 14px; margin: 4px 0;">Designation: <strong>${user.designation}</strong></p>
            </div>
            <div style="text-align: center; margin-top: 32px;">
              <a href="http://localhost:5173/login" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 10px; font-weight: bold; display: inline-block;">Log In to ZenFlow Dashboard</a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">© 2026 ZenFlow Platform.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        to: user.email,
        subject: '🎉 ZenFlow Account Approved - Welcome Aboard!',
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error('[Email Error]: Failed to send approval email:', emailErr.message);
    }

    await logActivity(req.user._id, 'Approve Employee', `Approved registration request for ${user.name} (${user.employeeId})`);

    // Emit Socket.IO event if io attached
    if (req.app.get('io')) {
      req.app.get('io').emit('user_approved', {
        id: user._id,
        name: user.name,
        employeeId: user.employeeId,
      });
    }

    res.status(200).json({
      success: true,
      message: `Employee ${user.name} (${user.employeeId}) has been approved successfully.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject employee registration request
// @route   PUT /api/admin/reject/:id
// @access  Private (Super Admin, HR Admin)
exports.rejectUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rejectionReason = reason || 'Registration details did not meet company criteria';

    user.status = 'Rejected';
    user.isApproved = false;
    user.rejectionReason = rejectionReason;
    await user.save();

    // Send Rejection Email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 40px; color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 28px; font-weight: 900; color: #ef4444;">ZenFlow</span>
            </div>
            <h2 style="color: #ef4444; font-size: 20px; margin-bottom: 12px;">Registration Request Status</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Thank you for your interest in ZenFlow. We regret to inform you that your registration request (ID: <strong>${user.employeeId}</strong>) has been declined by HR Admin.</p>
            <div style="background-color: #450a0a; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #991b1b;">
              <p style="color: #fca5a5; font-size: 12px; margin: 0 0 4px 0; font-weight: bold;">Reason for Rejection:</p>
              <p style="color: #ffffff; font-size: 14px; margin: 0;">${rejectionReason}</p>
            </div>
            <p style="color: #cbd5e1; font-size: 12px;">If you have any questions, please contact HR Administration.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        to: user.email,
        subject: 'ZenFlow Registration Status Update',
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error('[Email Error]: Failed to send rejection email:', emailErr.message);
    }

    await logActivity(req.user._id, 'Reject Employee', `Rejected registration request for ${user.name} (${user.employeeId}). Reason: ${rejectionReason}`);

    if (req.app.get('io')) {
      req.app.get('io').emit('user_rejected', {
        id: user._id,
        name: user.name,
        employeeId: user.employeeId,
      });
    }

    res.status(200).json({
      success: true,
      message: `Employee registration request for ${user.name} has been rejected.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Registration Statistics and Analytics
// @route   GET /api/admin/registrations
// @access  Private (Super Admin, HR Admin)
exports.getRegistrationStats = async (req, res, next) => {
  try {
    const pendingCount = await User.countDocuments({ status: 'Pending' });
    const approvedCount = await User.countDocuments({ status: 'Active', isApproved: true });
    const rejectedCount = await User.countDocuments({ status: 'Rejected' });
    const totalUsers = await User.countDocuments();

    // Department-wise pending distribution
    const deptDistribution = await User.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'deptInfo' } },
      { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
      { $project: { departmentName: { $ifNull: ['$deptInfo.name', 'Unassigned'] }, count: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalUsers,
        deptDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};
