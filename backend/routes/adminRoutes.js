const express = require('express');
const router = express.Router();
const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getRegistrationStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('Super Admin', 'HR Admin'));

router.get('/pending-users', getPendingUsers);
router.put('/approve/:id', approveUser);
router.put('/reject/:id', rejectUser);
router.get('/registrations', getRegistrationStats);

module.exports = router;
