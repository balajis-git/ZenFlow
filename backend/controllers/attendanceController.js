const Attendance = require('../models/Attendance');
const logActivity = require('../utils/logger');

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Clock In
// @route   POST /api/attendance/clock-in
// @access  Private
exports.clockIn = async (req, res, next) => {
  try {
    const todayStr = getLocalDateString(new Date());

    // Check if user already clocked in today
    let record = await Attendance.findOne({ user: req.user._id, date: todayStr });
    if (record) {
      return res.status(400).json({ success: false, message: 'You have already clocked in today' });
    }

    const clockInTime = new Date();
    
    // Compute status (Late if clocked in after 09:30 AM)
    const lateThreshold = new Date();
    lateThreshold.setHours(9, 30, 0, 0); // 09:30 AM
    const status = clockInTime > lateThreshold ? 'Late' : 'Present';

    record = await Attendance.create({
      user: req.user._id,
      date: todayStr,
      clockIn: clockInTime,
      status,
    });

    await logActivity(req.user._id, 'Clock In', `Clocked in at ${clockInTime.toLocaleTimeString()} (Status: ${status})`);

    res.status(200).json({
      success: true,
      message: 'Clocked in successfully',
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clock Out
// @route   POST /api/attendance/clock-out
// @access  Private
exports.clockOut = async (req, res, next) => {
  try {
    const todayStr = getLocalDateString(new Date());

    const record = await Attendance.findOne({ user: req.user._id, date: todayStr });
    if (!record) {
      return res.status(400).json({ success: false, message: 'No clock-in record found for today' });
    }
    if (record.clockOut) {
      return res.status(400).json({ success: false, message: 'You have already clocked out today' });
    }

    // If currently on break, auto-end the break
    const activeBreak = record.breaks.find(b => b.end === null);
    const clockOutTime = new Date();

    if (activeBreak) {
      activeBreak.end = clockOutTime;
    }

    record.clockOut = clockOutTime;

    // Calculate working hours in decimal format
    let totalMs = clockOutTime - record.clockIn;

    // Subtract break durations
    let breakMs = 0;
    record.breaks.forEach((b) => {
      const end = b.end || clockOutTime;
      breakMs += (end - b.start);
    });

    const workMs = totalMs - breakMs;
    const workingHours = Math.max(0, workMs / (1000 * 60 * 60)); // convert to hours
    record.workingHours = parseFloat(workingHours.toFixed(2));

    // If working hours < 4, mark status as Half Day
    if (record.workingHours < 4) {
      record.status = 'Half Day';
    }

    await record.save();
    await logActivity(req.user._id, 'Clock Out', `Clocked out at ${clockOutTime.toLocaleTimeString()} (Worked: ${record.workingHours} hrs)`);

    res.status(200).json({
      success: true,
      message: 'Clocked out successfully',
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Break (Start / End Break)
// @route   POST /api/attendance/break
// @access  Private
exports.toggleBreak = async (req, res, next) => {
  try {
    const todayStr = getLocalDateString(new Date());
    const record = await Attendance.findOne({ user: req.user._id, date: todayStr });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Must clock in before taking a break' });
    }
    if (record.clockOut) {
      return res.status(400).json({ success: false, message: 'Already clocked out for today' });
    }

    const now = new Date();
    const activeBreak = record.breaks.find(b => b.end === null);

    if (activeBreak) {
      // End break
      activeBreak.end = now;
      await record.save();
      await logActivity(req.user._id, 'End Break', `Ended break at ${now.toLocaleTimeString()}`);
      return res.status(200).json({
        success: true,
        message: 'Break ended successfully',
        attendance: record,
      });
    } else {
      // Start break
      record.breaks.push({ start: now });
      await record.save();
      await logActivity(req.user._id, 'Start Break', `Started break at ${now.toLocaleTimeString()}`);
      return res.status(200).json({
        success: true,
        message: 'Break started successfully',
        attendance: record,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's today status
// @route   GET /api/attendance/today-status
// @access  Private
exports.getTodayStatus = async (req, res, next) => {
  try {
    const todayStr = getLocalDateString(new Date());
    const record = await Attendance.findOne({ user: req.user._id, date: todayStr });

    res.status(200).json({
      success: true,
      attendance: record || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee attendance logs (Self history or HR/Admin reviewing)
// @route   GET /api/attendance/history/:userId
// @access  Private
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.user._id;

    // Enforce check: self or admin/hr
    if (
      req.user.role !== 'Super Admin' &&
      req.user.role !== 'HR Admin' &&
      req.user._id.toString() !== targetUserId.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this log history' });
    }

    const logs = await Attendance.find({ user: targetUserId })
      .sort({ date: -1 })
      .limit(60); // fetch last 2 months

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
