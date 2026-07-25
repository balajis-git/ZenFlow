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
    const { name, email, password, role, designation, salary } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      designation,
      salary,
      verificationToken,
    });

    // Send email verification link
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <h1>Verify your Email</h1>
      <p>Thank you for registering on ZenFlow. Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email Address</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await transporter.sendMail({
      to: user.email,
      subject: 'ZenFlow - Email Verification',
      html: emailHtml,
    });

    await logActivity(user._id, 'Register Account', 'Registered new user account successfully');

    res.status(201).json({
      success: true,
      message: 'User registered successfully. A verification link has been sent to your email.',
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is suspended or inactive' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    // Set Cookies
    setCookieToken(res, 'accessToken', accessToken, 1);
    setCookieToken(res, 'refreshToken', refreshToken, 7);

    await logActivity(user._id, 'User Login', 'User logged in successfully');

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
