const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { employeeValidator } = require('../validators/schemas');
const validateFields = require('../middleware/validator');

const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
]);

router.use(protect);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post(
  '/',
  authorize('Super Admin', 'HR Admin'),
  uploadFields,
  employeeValidator,
  validateFields,
  createEmployee
);
router.put('/:id', uploadFields, updateEmployee);
router.delete('/:id', authorize('Super Admin', 'HR Admin'), deleteEmployee);

module.exports = router;
