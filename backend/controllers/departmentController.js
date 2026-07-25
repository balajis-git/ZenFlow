const Department = require('../models/Department');
const User = require('../models/User');
const logActivity = require('../utils/logger');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('manager', 'name email designation profileImage');
    res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department details
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'name email designation profileImage');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const employees = await User.find({ department: req.params.id }).select('name email designation role profileImage');

    res.status(200).json({
      success: true,
      department,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department (Super Admin, HR Admin)
// @route   POST /api/departments
// @access  Private (Super Admin, HR Admin)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, manager } = req.body;

    const deptExists = await Department.findOne({ name });
    if (deptExists) {
      return res.status(400).json({ success: false, message: 'Department name already exists' });
    }

    // Check if manager is a valid user
    if (manager) {
      const user = await User.findById(manager);
      if (!user) {
        return res.status(400).json({ success: false, message: 'Assigned manager user not found' });
      }
    }

    const department = await Department.create({
      name,
      description,
      manager: manager || null,
    });

    await logActivity(req.user._id, 'Create Department', `Created department ${department.name}`);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department (Super Admin, HR Admin)
// @route   PUT /api/departments/:id
// @access  Private (Super Admin, HR Admin)
exports.updateDepartment = async (req, res, next) => {
  try {
    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const { name, description, manager } = req.body;

    if (name && name !== department.name) {
      const nameExists = await Department.findOne({ name });
      if (nameExists) {
        return res.status(400).json({ success: false, message: 'Department name already exists' });
      }
    }

    if (manager) {
      const user = await User.findById(manager);
      if (!user) {
        return res.status(400).json({ success: false, message: 'Assigned manager user not found' });
      }
    }

    department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, manager: manager || null },
      { new: true, runValidators: true }
    );

    await logActivity(req.user._id, 'Update Department', `Updated department ${department.name}`);

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department (Super Admin, HR Admin)
// @route   DELETE /api/departments/:id
// @access  Private (Super Admin, HR Admin)
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Set all employees in this department back to null
    await User.updateMany({ department: req.params.id }, { $set: { department: null } });

    await Department.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'Delete Department', `Deleted department ${department.name}`);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
