const Task = require('../models/Task');
const Project = require('../models/Project');
const logActivity = require('../utils/logger');
const Notification = require('../models/Notification');

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email designation profileImage')
      .populate('dependencies', 'title status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email designation profileImage')
      .populate('project', 'name manager')
      .populate('dependencies', 'title status')
      .populate({
        path: 'taskHistory.updatedBy',
        select: 'name profileImage',
      });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin, HR, PM)
exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      deadline,
      priority,
      estimatedTime,
      labels,
      tags,
      dependencies,
    } = req.body;

    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(400).json({ success: false, message: 'Project reference not found' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      deadline,
      priority,
      estimatedTime,
      labels: labels || [],
      tags: tags || [],
      dependencies: dependencies || [],
      taskHistory: [
        {
          status: 'To Do',
          updatedBy: req.user._id,
          comment: 'Task created',
        },
      ],
    });

    // Notify user if assigned
    if (assignedTo) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'TaskAssigned',
        title: 'New Task Assigned',
        message: `You have been assigned to task: ${title}`,
        link: `/tasks/${task._id}`,
      });
    }

    await logActivity(req.user._id, 'Create Task', `Created task "${task.title}" under project "${proj.name}"`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const {
      title,
      description,
      assignedTo,
      deadline,
      priority,
      status,
      estimatedTime,
      actualTime,
      labels,
      tags,
      dependencies,
      comment,
    } = req.body;

    const statusChanged = status && status !== task.status;

    // Track status change in history
    const historyEntry = {};
    if (statusChanged) {
      historyEntry.status = status;
      historyEntry.updatedBy = req.user._id;
      historyEntry.comment = comment || `Status moved from ${task.status} to ${status}`;
      historyEntry.updatedAt = new Date();
    }

    // Build update object
    const updateObj = {
      title,
      description,
      assignedTo,
      deadline,
      priority,
      status,
      estimatedTime,
      actualTime,
      labels,
      tags,
      dependencies,
    };

    // Remove undefined values
    Object.keys(updateObj).forEach((key) => {
      if (updateObj[key] === undefined) delete updateObj[key];
    });

    if (statusChanged) {
      await Task.findByIdAndUpdate(req.params.id, {
        $set: updateObj,
        $push: { taskHistory: historyEntry },
      });
    } else {
      await Task.findByIdAndUpdate(req.params.id, { $set: updateObj });
    }

    // Refresh model representation
    task = await Task.findById(req.params.id).populate('assignedTo', 'name email designation profileImage');

    // Notify assignee of assignment/status change
    if (assignedTo && assignedTo.toString() !== (task.assignedTo ? task.assignedTo._id.toString() : '')) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'TaskAssigned',
        title: 'Task Reassigned',
        message: `Task "${task.title}" has been reassigned to you.`,
        link: `/tasks/${task._id}`,
      });
    }

    if (statusChanged && task.assignedTo) {
      await Notification.create({
        recipient: task.assignedTo._id,
        sender: req.user._id,
        type: 'ProjectUpdate',
        title: 'Task Status Updated',
        message: `Task "${task.title}" status is now: ${status}`,
        link: `/tasks/${task._id}`,
      });
    }

    await logActivity(req.user._id, 'Update Task', `Updated task "${task.title}" details`);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status ONLY (For Kanban drag and drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const prevStatus = task.status;
    task.status = status;
    task.taskHistory.push({
      status,
      updatedBy: req.user._id,
      comment: `Dragged task from ${prevStatus} to ${status}`,
      updatedAt: new Date(),
    });

    await task.save();

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email designation profileImage');

    // Notify assignee
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: task.assignedTo,
        sender: req.user._id,
        type: 'ProjectUpdate',
        title: 'Task Status Changed',
        message: `Task "${task.title}" moved to ${status}`,
        link: `/tasks/${task._id}`,
      });
    }

    await logActivity(req.user._id, 'Kanban Move Task', `Moved task "${task.title}" to "${status}"`);

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
exports.uploadTaskAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
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

    task.attachments.push(newAttachment);
    await task.save();

    await logActivity(req.user._id, 'Upload Task Attachment', `Uploaded attachment ${req.file.originalname} for task ${task.title}`);

    res.status(200).json({
      success: true,
      message: 'File attached successfully',
      attachments: task.attachments,
    });
  } catch (error) {
    next(error);
  }
};
