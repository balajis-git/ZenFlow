const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/nodemailer');
const logActivity = require('../utils/logger');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const getJWTSecrets = () => {
  return {
    secret: process.env.JWT_SECRET || 'zenflow_jwt_secret_key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'zenflow_jwt_refresh_secret_key',
  };
};

const generateTokens = (userId) => {
  const { secret, refreshSecret } = getJWTSecrets();
  const accessToken = jwt.sign({ id: userId }, secret, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ id: userId }, refreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
};

const setCookieToken = (res, tokenName, token, days) => {
  res.cookie(tokenName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      employeeId,
      email,
      phone,
      password,
      confirmPassword,
      role,
      department,
      designation,
      skills,
      experience,
      joiningDate,
    } = req.body;

    const targetRole = role || 'Employee';

    // Single Account Restriction for Admin, HR, and PM roles
    const restrictedRoles = ['Super Admin', 'HR Admin', 'Project Manager'];
    if (restrictedRoles.includes(targetRole)) {
      const existingRoleUser = await User.findOne({ role: targetRole });
      if (existingRoleUser) {
        return res.status(400).json({
          success: false,
          message: 'This role already has an account.',
        });
      }
    }

    if (password && confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Password Validation: min 8 chars, uppercase, lowercase, number, special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    // Phone Validation: 10 digits
    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits.',
      });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    // Handle Employee ID
    let finalEmpId = employeeId;
    if (finalEmpId) {
      const empIdExists = await User.findOne({ employeeId: finalEmpId });
      if (empIdExists) {
        return res.status(400).json({ success: false, message: 'Employee ID already exists' });
      }
    } else {
      const count = await User.countDocuments();
      finalEmpId = `EMP-${1000 + count + 1}`;
    }

    // Process file uploads if present
    let profileImage = undefined;
    let resumeUrl = undefined;
    if (req.files) {
      if (req.files.profileImage) profileImage = req.files.profileImage[0].path;
      if (req.files.resume) resumeUrl = req.files.resume[0].path;
    }

    const user = await User.create({
      name,
      employeeId: finalEmpId,
      email,
      phone,
      password,
      role: targetRole,
      department: department || null,
      designation: designation || (targetRole === 'Super Admin' ? 'CEO' : targetRole === 'HR Admin' ? 'HR Director' : targetRole === 'Project Manager' ? 'Lead PM' : 'Team Member'),
      skills: skills ? (typeof skills === 'string' ? (skills.includes('[') ? JSON.parse(skills) : skills.split(',').map(s => s.trim())) : skills) : [],
      experience: experience ? (typeof experience === 'string' ? (experience.includes('[') ? JSON.parse(experience) : []) : experience) : [],
      joiningDate: joiningDate || Date.now(),
      profileImage,
      resumeUrl,
      status: 'Active',
      isApproved: true,
      emailVerified: true,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });
    setCookieToken(res, 'accessToken', accessToken, 1);
    setCookieToken(res, 'refreshToken', refreshToken, 7);

    await logActivity(user._id, 'Register Account', `Registered new ${user.role} user account: ${user.name} (${user.employeeId})`);

    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token: accessToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email Address
// @route   GET /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Invalid or missing verification token' });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();

    await logActivity(user._id, 'Verify Email', 'Email verified successfully');

    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px;">
        <h2 style="color: #2563EB;">Email Verified Successfully!</h2>
        <p>Your ZenFlow account email has been verified. You may close this tab and log in to the dashboard.</p>
      </div>
    `);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user with Role Verification
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Role Verification
    if (role && user.role !== role) {
      return res.status(400).json({
        success: false,
        message: `Selected role (${role}) does not match your registered account role (${user.role}).`,
      });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is disabled or inactive.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    // Set Cookies
    setCookieToken(res, 'accessToken', accessToken, 1);
    setCookieToken(res, 'refreshToken', refreshToken, 7);

    await logActivity(user._id, 'User Login', `User ${user.name} (${user.role}) logged in successfully`);

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    let token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    const { refreshSecret } = getJWTSecrets();
    let decoded;
    try {
      decoded = jwt.verify(token, refreshSecret);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findOne({ _id: decoded.id, refreshTokens: token });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Refresh token not found in database' });
    }

    const tokens = generateTokens(user._id);

    await User.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: token },
    });
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
    });

    setCookieToken(res, 'accessToken', tokens.accessToken, 1);
    setCookieToken(res, 'refreshToken', tokens.refreshToken, 7);

    res.status(200).json({
      success: true,
      token: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password-page?token=${resetToken}`;
    const emailHtml = `
      <h1>Password Reset Request</h1>
      <p>We received a password reset request for your ZenFlow account. Click the link below to change your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;

    await transporter.sendMail({
      to: user.email,
      subject: 'ZenFlow - Password Reset Request',
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokens = [];
    await user.save();

    await logActivity(user._id, 'Reset Password', 'Password was reset successfully');

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & Clear sessions
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: token },
      });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    if (req.user) {
      await logActivity(req.user._id, 'User Logout', 'User logged out and cookies cleared');
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('department');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Serve simple HTML page to reset password
// @route   GET /api/auth/reset-password-page
// @access  Public
exports.resetPasswordPage = async (req, res, next) => {
  const { token } = req.query;
  res.send(`
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="color: #2563EB; text-align: center; margin-bottom: 20px;">ZenFlow Reset Password</h2>
      <form action="/api/auth/reset-password" method="POST" style="display: flex; flex-direction: column; gap: 12px;">
        <input type="hidden" name="token" value="${token}" />
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 14px; color: #4B5563;">New Password:</label>
          <input type="password" name="newPassword" required style="padding: 8px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px;" />
        </div>
        <button type="submit" style="padding: 10px; background-color: #2563EB; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px;">Update Password</button>
      </form>
    </div>
  `);
};
