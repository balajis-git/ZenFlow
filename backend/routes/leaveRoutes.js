const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { leaveValidator } = require('../validators/schemas');
const validateFields = require('../middleware/validator');

router.use(protect);

router.post('/', leaveValidator, validateFields, applyLeave);
router.get('/my-requests', getMyLeaveRequests);
router.get('/', getAllLeaveRequests);
router.patch('/:id/status', updateLeaveStatus);

module.exports = router;
