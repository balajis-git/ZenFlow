const express = require('express');
const router = express.Router();
const {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  uploadTaskAttachment,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { taskValidator } = require('../validators/schemas');
const validateFields = require('../middleware/validator');

router.use(protect);

router.get('/project/:projectId', getTasksByProject);
router.get('/:id', getTaskById);
router.post('/', authorize('Super Admin', 'HR Admin', 'Project Manager'), taskValidator, validateFields, createTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);

// Task attachments upload
router.post('/:id/attachments', upload.single('attachment'), uploadTaskAttachment);

module.exports = router;
