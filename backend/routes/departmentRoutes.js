const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');
const { departmentValidator } = require('../validators/schemas');
const validateFields = require('../middleware/validator');

router.use(protect);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize('Super Admin', 'HR Admin'), departmentValidator, validateFields, createDepartment);
router.put('/:id', authorize('Super Admin', 'HR Admin'), departmentValidator, validateFields, updateDepartment);
router.delete('/:id', authorize('Super Admin', 'HR Admin'), deleteDepartment);

module.exports = router;
