const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const { generateExcelReport } = require('../services/excelService');
const { generatePDFReport } = require('../services/pdfService');

// @desc    Export reports
// @route   GET /api/reports/:type/:format
// @access  Private (Super Admin, HR Admin, Project Manager)
exports.exportReport = async (req, res, next) => {
  try {
    const { type, format } = req.params; // type: attendance|employees|projects|tasks|leaves, format: excel|pdf

    if (!['attendance', 'employees', 'projects', 'tasks', 'leaves'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid report type request' });
    }
    if (!['excel', 'pdf'].includes(format)) {
      return res.status(400).json({ success: false, message: 'Invalid export file format' });
    }

    if (req.user.role === 'Employee') {
      return res.status(403).json({ success: false, message: 'Employees are not permitted to export data' });
    }

    let headers = [];
    let rows = [];
    let title = '';

    if (type === 'attendance') {
      title = 'Attendance Report';
      headers = ['Employee Name', 'Date', 'Clock In', 'Clock Out', 'Working Hours', 'Status'];
      
      const attendanceLogs = await Attendance.find()
        .populate('user', 'name')
        .sort({ date: -1 });

      rows = attendanceLogs.map((log) => [
        log.user ? log.user.name : 'Unknown',
        log.date,
        log.clockIn ? new Date(log.clockIn).toLocaleTimeString() : '-',
        log.clockOut ? new Date(log.clockOut).toLocaleTimeString() : '-',
        log.workingHours || 0,
        log.status,
      ]);
    } else if (type === 'employees') {
      title = 'Employee Directory Report';
      headers = ['Name', 'Email', 'Role', 'Designation', 'Salary ($)', 'Joining Date', 'Status'];
      
      const employees = await User.find().sort({ name: 1 });

      rows = employees.map((emp) => [
        emp.name,
        emp.email,
        emp.role,
        emp.designation || '-',
        emp.salary || 0,
        emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '-',
        emp.status,
      ]);
    } else if (type === 'projects') {
      title = 'Projects Analytics Report';
      headers = ['Project Name', 'Manager', 'Timeline', 'Budget ($)', 'Priority', 'Status', 'Progress (%)'];
      
      const projects = await Project.find().populate('manager', 'name');

      rows = projects.map((p) => [
        p.name,
        p.manager ? p.manager.name : 'Unassigned',
        `${new Date(p.startDate).toLocaleDateString()} to ${new Date(p.endDate).toLocaleDateString()}`,
        p.budget || 0,
        p.priority,
        p.status,
        p.progress || 0,
      ]);
    } else if (type === 'tasks') {
      title = 'Tasks Backlog Report';
      headers = ['Task Title', 'Project Name', 'Assigned To', 'Deadline', 'Priority', 'Status', 'Estimated (Hrs)', 'Actual (Hrs)'];
      
      const tasks = await Task.find()
        .populate('project', 'name')
        .populate('assignedTo', 'name');

      rows = tasks.map((t) => [
        t.title,
        t.project ? t.project.name : 'Unknown Project',
        t.assignedTo ? t.assignedTo.name : 'Unassigned',
        new Date(t.deadline).toLocaleDateString(),
        t.priority,
        t.status,
        t.estimatedTime || 0,
        t.actualTime || 0,
      ]);
    } else if (type === 'leaves') {
      title = 'Leave Requests Report';
      headers = ['Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Approved By'];
      
      const leaves = await Leave.find()
        .populate('user', 'name')
        .populate('approvedBy', 'name');

      rows = leaves.map((l) => [
        l.user ? l.user.name : 'Unknown',
        l.leaveType,
        new Date(l.startDate).toLocaleDateString(),
        new Date(l.endDate).toLocaleDateString(),
        l.reason,
        l.status,
        l.approvedBy ? l.approvedBy.name : '-',
      ]);
    }

    if (format === 'excel') {
      await generateExcelReport(res, title, headers, rows);
    } else {
      generatePDFReport(res, title, headers, rows);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics counters and charts
// @route   GET /api/reports/dashboard-analytics
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    // Filters for count aggregates
    let projectFilter = {};
    let taskFilter = {};

    if (role === 'Project Manager') {
      projectFilter.$or = [{ manager: userId }, { members: userId }];
      taskFilter.assignedTo = userId; // or get all tasks from projects managed
      const managedProjects = await Project.find({ manager: userId }).select('_id');
      const managedProjectIds = managedProjects.map(p => p._id);
      taskFilter = { $or: [{ assignedTo: userId }, { project: { $in: managedProjectIds } }] };
    } else if (role === 'Employee') {
      projectFilter.members = userId;
      taskFilter.assignedTo = userId;
    }

    // Counters
    const totalProjects = await Project.countDocuments(projectFilter);
    const completedProjects = await Project.countDocuments({ ...projectFilter, status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ ...taskFilter, status: { $ne: 'Completed' } });
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'Completed' });

    // Leave status counters
    let leaveFilter = {};
    if (role === 'Employee') {
      leaveFilter.user = userId;
    }
    const pendingLeaves = await Leave.countDocuments({ ...leaveFilter, status: 'Pending' });

    // Attendance rate details today (Present vs Absent)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendanceCount = await Attendance.countDocuments({ date: todayStr });
    const totalUsersCount = await User.countDocuments({ status: 'Active' });

    // Project Progress breakdown
    const projectsList = await Project.find(projectFilter).select('name progress status');

    // Recent activity feed
    let logsQuery = {};
    if (role === 'Employee') {
      logsQuery.user = userId;
    }
    const activityLogs = await Attendance.db.model('ActivityLog')
      .find(logsQuery)
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      analytics: {
        totalProjects,
        completedProjects,
        pendingTasks,
        completedTasks,
        pendingLeaves,
        attendanceToday: {
          present: todayAttendanceCount,
          total: totalUsersCount,
        },
        projectsList,
        activityLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Paginated Activity & Audit Logs
// @route   GET /api/reports/activity-logs
// @access  Private
exports.getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role === 'Employee') {
      query.user = req.user._id;
    }

    const ActivityLog = Attendance.db.model('ActivityLog');
    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      logs,
    });
  } catch (error) {
    next(error);
  }
};
