const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Extract from Auth Header or Cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zenflow_jwt_secret_key');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (req.user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is suspended or inactive' });
    }
    next();
  } catch (error) {
    console.error(`[Auth Middleware] JWT Verify Error: ${error.message}`);
    return res.status(401).json({ success: false, message: 'Not authorized, token expired or invalid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user ? req.user.role : 'Guest'} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
