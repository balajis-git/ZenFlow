const User = require('../models/User');
const Department = require('../models/Department');
const logActivity = require('../utils/logger');
const { isCloudinaryConfigured } = require('../config/cloudinary');

// @desc    Get all employees (Paginated, Searchable, Filterable)
// @route   GET /api/employees
// @access  Private (Admin, HR, PM, Employee)
exports.getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Search query (name or email)
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Role filter
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Department filter
    if (req.query.department) {
      query.department = req.query.department;
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .populate('department', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id).populate('department');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (Super Admin, HR Admin)
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      designation,
      salary,
      joiningDate,
      skills,
      experience,
      phone,
      emergencyContact,
    } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // If department is provided, check if it exists
    if (department) {
      const dept = await Department.findById(department);
      if (!dept) {
        return res.status(400).json({ success: false, message: 'Department does not exist' });
      }
    }

    // Handle resume/avatar if uploaded
    let profileImage = undefined;
    let resumeUrl = undefined;

    if (req.files) {
      if (req.files.profileImage) {
        profileImage = req.files.profileImage[0].path;
      }
      if (req.files.resume) {
        resumeUrl = req.files.resume[0].path;
      }
    }

    const employee = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      department: department || null,
      designation,
      salary,
      joiningDate: joiningDate || Date.now(),
      skills: skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : [],
      experience: experience ? (typeof experience === 'string' ? JSON.parse(experience) : experience) : [],
      phone,
      emergencyContact: emergencyContact ? (typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact) : undefined,
      profileImage,
      resumeUrl,
      emailVerified: true, // Created by HR/Admin directly
    });

    if (department) {
      await Department.findByIdAndUpdate(department, { $inc: { employeesCount: 1 } });
    }

    await logActivity(req.user._id, 'Create Employee', `Created employee profile for ${employee.name}`);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee profile
// @route   PUT /api/employees/:id
// @access  Private (Self or Super Admin/HR Admin)
exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Enforce check: must be Admin/HR or self updating their own info
    if (req.user.role !== 'Super Admin' && req.user.role !== 'HR Admin' && req.user._id.toString() !== employee._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const fieldsToUpdate = {};
    const allowedFieldsAdmin = [
      'name',
      'role',
      'department',
      'designation',
      'salary',
      'joiningDate',
      'status',
    ];
    const allowedFieldsSelf = [
      'name',
      'phone',
      'skills',
      'experience',
      'emergencyContact',
    ];

    const isAuthorizedAdmin = req.user.role === 'Super Admin' || req.user.role === 'HR Admin';

    // Apply Admin fields
    if (isAuthorizedAdmin) {
      allowedFieldsAdmin.forEach((field) => {
        if (req.body[field] !== undefined) {
          fieldsToUpdate[field] = req.body[field];
        }
      });
    }

    // Apply self updates (Admin can update these too)
    allowedFieldsSelf.forEach((field) => {
      if (req.body[field] !== undefined) {
        let val = req.body[field];
        if (field === 'skills' && typeof val === 'string') val = JSON.parse(val);
        if (field === 'experience' && typeof val === 'string') val = JSON.parse(val);
        if (field === 'emergencyContact' && typeof val === 'string') val = JSON.parse(val);
        fieldsToUpdate[field] = val;
      }
    });

    // Handle files if uploaded or string image URL
    if (req.body.profileImage && typeof req.body.profileImage === 'string') {
      fieldsToUpdate.profileImage = req.body.profileImage;
    }
    if (req.files) {
      if (req.files.profileImage) {
        fieldsToUpdate.profileImage = req.files.profileImage[0].path;
      }
      if (req.files.resume) {
        fieldsToUpdate.resumeUrl = req.files.resume[0].path;
      }
    }

    // Department employeeCount logic
    if (fieldsToUpdate.department && employee.department && fieldsToUpdate.department.toString() !== employee.department.toString()) {
      await Department.findByIdAndUpdate(employee.department, { $inc: { employeesCount: -1 } });
      await Department.findByIdAndUpdate(fieldsToUpdate.department, { $inc: { employeesCount: 1 } });
    } else if (fieldsToUpdate.department && !employee.department) {
      await Department.findByIdAndUpdate(fieldsToUpdate.department, { $inc: { employeesCount: 1 } });
    }

    employee = await User.findByIdAndUpdate(req.params.id, { $set: fieldsToUpdate }, { new: true, runValidators: true });

    await logActivity(req.user._id, 'Update Employee', `Updated employee profile of ${employee.name}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee (Only Super Admin/HR Admin)
// @route   DELETE /api/employees/:id
// @access  Private (Super Admin, HR Admin)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Decrement department counter
    if (employee.department) {
      await Department.findByIdAndUpdate(employee.department, { $inc: { employeesCount: -1 } });
    }

    await User.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'Delete Employee', `Deleted employee account of ${employee.name}`);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
