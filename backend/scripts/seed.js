require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: './.env' });
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const dbUri = process.env.MONGODB_URI || 'mongodb+srv://balajisenthil1955_db_user:YtsohyrywohRLhtu@cluster0.qhrelhs.mongodb.net/zenflow?retryWrites=true&w=majority&appName=Cluster0';

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${dbUri}`);
    await mongoose.connect(dbUri);
    console.log('[Seed] Connected. Cleaning collections...');

    await User.deleteMany();
    await Department.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Chat.deleteMany();
    await Message.deleteMany();
    await Comment.deleteMany();
    await Notification.deleteMany();
    await ActivityLog.deleteMany();

    console.log('[Seed] DB Clean complete. Seeding default departments...');

    const depHR = await Department.create({
      name: 'Human Resources',
      description: 'Manages employee onboarding, payroll overview, leaves, and attendance reports.',
    });

    const depEng = await Department.create({
      name: 'Engineering',
      description: 'Core product engineering, feature delivery, and software updates.',
    });

    const depExec = await Department.create({
      name: 'Executive Management',
      description: 'System settings, company management, and strategic overview.',
    });

    console.log('[Seed] Departments created. Seeding default user roles...');

    // 2. Default System Admin Accounts
    const existingSuperAdmin = await User.findOne({ email: 'admin@zenflow.com' });
    if (!existingSuperAdmin) {
      await User.create({
        name: 'Super Admin',
        employeeId: 'EMP-0001',
        email: 'admin@zenflow.com',
        password: 'Admin@123',
        role: 'Super Admin',
        department: depExec._id,
        designation: 'Chief Executive Officer',
        salary: 180000,
        phone: '9876543210',
        status: 'Active',
        isApproved: true,
        emailVerified: true,
        profileImage: 'http://localhost:5000/uploads/male_employee_avatar.jpg',
      });
    }

    const existingHRAdmin = await User.findOne({ email: 'hr@zenflow.com' });
    if (!existingHRAdmin) {
      await User.create({
        name: 'HR Admin',
        employeeId: 'EMP-0002',
        email: 'hr@zenflow.com',
        password: 'HR@123',
        role: 'HR Admin',
        department: depHR._id,
        designation: 'HR Director',
        salary: 95000,
        phone: '9876543211',
        status: 'Active',
        isApproved: true,
        emailVerified: true,
        profileImage: 'http://localhost:5000/uploads/male_employee_avatar.jpg',
      });
    }

    const existingPM = await User.findOne({ email: 'pm@zenflow.com' });
    if (!existingPM) {
      await User.create({
        name: 'Project Manager',
        employeeId: 'EMP-0003',
        email: 'pm@zenflow.com',
        password: 'PM@123',
        role: 'Project Manager',
        department: depEng._id,
        designation: 'Lead Project Manager',
        salary: 110000,
        phone: '9876543212',
        status: 'Active',
        isApproved: true,
        emailVerified: true,
        profileImage: 'http://localhost:5000/uploads/male_employee_avatar.jpg',
      });
    }

    const existingEmp = await User.findOne({ email: 'employee@zenflow.com' });
    if (!existingEmp) {
      await User.create({
        name: 'Senior Employee',
        employeeId: 'EMP-0004',
        email: 'employee@zenflow.com',
        password: 'Employee@123',
        role: 'Employee',
        department: depEng._id,
        designation: 'Senior Full Stack Engineer',
        salary: 85000,
        phone: '9876543213',
        status: 'Active',
        isApproved: true,
        emailVerified: true,
        profileImage: 'http://localhost:5000/uploads/male_employee_avatar.jpg',
      });
    }

    // Preserve original legacy admin accounts
    const legacyAdmin = await User.findOne({ email: 'admin@workflowx.com' });
    if (!legacyAdmin) {
      await User.create({
        name: 'John Doe (Admin)',
        employeeId: 'EMP-1000',
        email: 'admin@workflowx.com',
        password: 'Admin123',
        role: 'Super Admin',
        department: depExec._id,
        designation: 'CEO / Chief Executive',
        salary: 180000,
        phone: '+1 (555) 019-9000',
        status: 'Active',
        isApproved: true,
        emailVerified: true,
        profileImage: 'http://localhost:5000/uploads/male_employee_avatar.jpg',
      });
    }

    // Assign references for project and task seeding
    const superAdmin = await User.findOne({ role: 'Super Admin' });
    const hrAdmin = await User.findOne({ role: 'HR Admin' });
    const projectManager = await User.findOne({ role: 'Project Manager' });
    const employee = await User.findOne({ role: 'Employee' });

    depHR.manager = hrAdmin._id;
    depHR.employeesCount = 1;
    await depHR.save();

    depEng.manager = projectManager._id;
    depEng.employeesCount = 2;
    await depEng.save();

    depExec.manager = superAdmin._id;
    depExec.employeesCount = 1;
    await depExec.save();

    console.log('[Seed] Users created. Seeding sample Project...');

    const sampleProject = await Project.create({
      name: 'ZenFlow Enterprise Platform',
      description: 'Building the core company ERP, Kanban boards, chat engine, and attendance tracker dashboard.',
      manager: projectManager._id,
      members: [employee._id, hrAdmin._id],
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-10-30'),
      budget: 75000,
      priority: 'High',
      status: 'In Progress',
      progress: 40,
    });

    console.log('[Seed] Projects created. Seeding sample Tasks...');

    const task1 = await Task.create({
      title: 'Design Dashboard Wireframes',
      description: 'Create Figma mocks for the ZenFlow main dashboard analytics.',
      project: sampleProject._id,
      assignedTo: employee._id,
      deadline: new Date('2026-08-10'),
      priority: 'High',
      status: 'Completed',
      estimatedTime: 12,
      actualTime: 14,
      labels: ['Design', 'UI/UX'],
      tags: ['Sprint 1'],
    });

    const task2 = await Task.create({
      title: 'Setup Socket.IO Real-time Channels',
      description: 'Implement backend socket hooks for employee chats and notification alerts.',
      project: sampleProject._id,
      assignedTo: employee._id,
      deadline: new Date('2026-08-30'),
      priority: 'Medium',
      status: 'In Progress',
      estimatedTime: 20,
      actualTime: 8,
      labels: ['Backend', 'Websockets'],
      tags: ['Sprint 2'],
      dependencies: [task1._id],
    });

    const task3 = await Task.create({
      title: 'Verify PDF/Excel Export Routes',
      description: 'Create and test reports controllers to render pdf kit and excel files.',
      project: sampleProject._id,
      assignedTo: projectManager._id,
      deadline: new Date('2026-09-15'),
      priority: 'Low',
      status: 'To Do',
      estimatedTime: 8,
      labels: ['Reporting', 'API'],
      tags: ['Sprint 3'],
    });

    console.log('[Seed] Tasks seeded. Creating attendance logs...');

    await Attendance.create([
      {
        user: employee._id,
        date: '2026-07-24',
        clockIn: new Date('2026-07-24T09:05:00.000Z'),
        clockOut: new Date('2026-07-24T18:00:00.000Z'),
        workingHours: 8.92,
        status: 'Present',
      },
      {
        user: employee._id,
        date: '2026-07-25',
        clockIn: new Date('2026-07-25T09:45:00.000Z'),
        clockOut: null,
        status: 'Late',
      },
      {
        user: projectManager._id,
        date: '2026-07-25',
        clockIn: new Date('2026-07-25T08:50:00.000Z'),
        clockOut: null,
        status: 'Present',
      },
    ]);

    console.log('[Seed] Attendance records seeded. Seeding sample Chat & Messages...');

    const chat = await Chat.create({
      type: 'private',
      participants: [projectManager._id, employee._id],
    });

    const msg1 = await Message.create({
      chat: chat._id,
      sender: projectManager._id,
      content: 'Hey Bob, how is progress going on the ZenFlow integration?',
      readBy: [projectManager._id, employee._id],
    });

    const msg2 = await Message.create({
      chat: chat._id,
      sender: employee._id,
      content: 'Hello PM! The new ZenFlow branding updates are rendered cleanly.',
      readBy: [projectManager._id, employee._id],
    });

    chat.latestMessage = msg2._id;
    await chat.save();

    console.log('[Seed] ZenFlow Database populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to populate database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
