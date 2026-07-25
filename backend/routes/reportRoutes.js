const express = require('express');
const router = express.Router();
const { exportReport, getDashboardAnalytics, getActivityLogs } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard-analytics', getDashboardAnalytics);
router.get('/activity-logs', getActivityLogs);
router.get('/export/:type/:format', exportReport);

module.exports = router;
