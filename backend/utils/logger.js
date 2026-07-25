const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, details = '', ipAddress = '') => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error(`[Activity Log Error] Failed to write activity log: ${error.message}`);
  }
};

module.exports = logActivity;
