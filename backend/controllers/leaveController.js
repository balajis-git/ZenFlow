const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');
const logActivity = require('../utils/logger');

// @desc    Apply for Leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
    }

    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await logActivity(req.user._id, 'Apply Leave', `Applied for ${leaveType} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`);

    // Notify Admins & HR Admins
    const adminHrs = await User.find({ role: { $in: ['Super Admin', 'HR Admin'] } });
    const notificationPromises = adminHrs.map((admin) => {
      return Notification.create({
        recipient: admin._id,
        sender: req.user._id,
        type: 'Mention',
        title: 'New Leave Request',
        message: `${req.user.name} applied for ${leaveType}`,
        link: `/leaves/approvals`,
      });
    });
    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave requests of logged in user (Self)
// @route   GET /api/leaves/my-requests
// @access  Private
exports.getMyLeaveRequests = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave requests (Super Admin, HR Admin, Project Manager)
// @route   GET /api/leaves
// @access  Private
exports.getAllLeaveRequests = async (req, res, next) => {
  try {
    if (req.user.role === 'Employee') {
      return res.status(403).json({ success: false, message: 'Not authorized to view all requests' });
    }

    const leaves = await Leave.find()
      .populate('user', 'name email designation department profileImage')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject Leave (Super Admin, HR Admin, Project Manager)
// @route   PATCH /api/leaves/:id/status
// @access  Private
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid leave status resolution' });
    }

    if (req.user.role === 'Employee') {
      return res.status(403).json({ success: false, message: 'Not authorized to approve/reject leaves' });
    }

    const leave = await Leave.findById(req.params.id).populate('user', 'name email');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.notes = notes || '';
    await leave.save();

    await logActivity(req.user._id, 'Review Leave', `Marked leave request for ${leave.user.name} as ${status}`);

    // Notify employee of approval/rejection
    await Notification.create({
      recipient: leave.user._id,
      sender: req.user._id,
      type: status === 'Approved' ? 'LeaveApproved' : 'LeaveRejected',
      title: `Leave Request ${status}`,
      message: `Your leave request for ${leave.leaveType} has been ${status.toLowerCase()}`,
      link: '/leaves',
    });

    res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    next(error);
  }
};
