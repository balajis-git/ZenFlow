const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  uploadAttachment,
  addComment,
  getComments,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { projectValidator } = require('../validators/schemas');
const validateFields = require('../middleware/validator');

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize('Super Admin', 'HR Admin', 'Project Manager'), projectValidator, validateFields, createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project attachments upload
router.post('/:id/attachments', upload.single('attachment'), uploadAttachment);

// Comment routes (Shares project/task scope)
router.post('/comments', addComment);
router.get('/comments/:entityType/:entityId', getComments);

module.exports = router;
