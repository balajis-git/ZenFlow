const Project = require('../models/Project');
const User = require('../models/User');
const Comment = require('../models/Comment');
const logActivity = require('../utils/logger');

// @desc    Get all projects (Filtered based on Role permissions)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let query = {};

    // PM and Employees only see projects they belong to or manage
    if (req.user.role === 'Project Manager') {
      query.$or = [{ manager: req.user._id }, { members: req.user._id }];
    } else if (req.user.role === 'Employee') {
      query.members = req.user._id;
    }

    const projects = await Project.find(query)
      .populate('manager', 'name email designation profileImage')
      .populate('members', 'name email designation profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email designation profileImage')
      .populate('members', 'name email designation profileImage');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Role-based auth check
    if (
      req.user.role === 'Employee' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project (Super Admin, HR Admin, Project Manager)
// @route   POST /api/projects
// @access  Private (Admin, HR, PM)
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, manager, members, startDate, endDate, budget, priority } = req.body;

    // Check manager exists and is PM/HR/Admin
    const mgrUser = await User.findById(manager);
    if (!mgrUser) {
      return res.status(400).json({ success: false, message: 'Assigned manager user not found' });
    }

    const project = await Project.create({
      name,
      description,
      manager,
      members: members || [],
      startDate,
      endDate,
      budget,
      priority,
    });

    await logActivity(req.user._id, 'Create Project', `Created project ${project.name}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project (Manager of project, Super Admin, HR Admin)
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Auth check: only Manager of this project or HR/Admin
    const isProjectManager = project.manager.toString() === req.user._id.toString();
    const isAdminOrHr = req.user.role === 'Super Admin' || req.user.role === 'HR Admin';

    if (!isProjectManager && !isAdminOrHr) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this project' });
    }

    const { name, description, manager, members, startDate, endDate, budget, priority, status, progress } = req.body;

    if (manager) {
      const mgrUser = await User.findById(manager);
      if (!mgrUser) {
        return res.status(400).json({ success: false, message: 'Assigned manager user not found' });
      }
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, manager, members, startDate, endDate, budget, priority, status, progress },
      { new: true, runValidators: true }
    );

    await logActivity(req.user._id, 'Update Project', `Updated project ${project.name}`);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (Super Admin, HR Admin, or assigned Project Manager)
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isProjectManager = project.manager.toString() === req.user._id.toString();
    const isAdminOrHr = req.user.role === 'Super Admin' || req.user.role === 'HR Admin';

    if (!isProjectManager && !isAdminOrHr) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'Delete Project', `Deleted project ${project.name}`);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add attachment to project
// @route   POST /api/projects/:id/attachments
// @access  Private
exports.uploadAttachment = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided for upload' });
    }

    const newAttachment = {
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
    };

    project.attachments.push(newAttachment);
    await project.save();

    await logActivity(req.user._id, 'Upload Project Attachment', `Uploaded attachment ${req.file.originalname} for project ${project.name}`);

    res.status(200).json({
      success: true,
      message: 'File attached successfully',
      attachments: project.attachments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Comment to Project/Task
// @route   POST /api/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { entityType, entityId, content } = req.body;

    const comment = await Comment.create({
      entityType,
      entityId,
      user: req.user._id,
      content,
    });

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name designation profileImage');

    res.status(210).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for an entity (Project/Task)
// @route   GET /api/comments/:entityType/:entityId
// @access  Private
exports.getComments = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const comments = await Comment.find({ entityType, entityId })
      .populate('user', 'name designation profileImage')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
};
