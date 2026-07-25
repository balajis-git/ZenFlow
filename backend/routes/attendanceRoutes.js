const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  toggleBreak,
  getTodayStatus,
  getAttendanceHistory,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/break', toggleBreak);
router.get('/today-status', getTodayStatus);
router.get('/history', getAttendanceHistory);
router.get('/history/:userId', getAttendanceHistory);

module.exports = router;
