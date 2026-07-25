const { body } = require('express-validator');

const registerValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter'),
  body('role')
    .optional()
    .isIn(['Super Admin', 'HR Admin', 'Project Manager', 'Employee'])
    .withMessage('Invalid role classification'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const employeeValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Provide a valid email address').normalizeEmail(),
  body('role')
    .isIn(['HR Admin', 'Project Manager', 'Employee'])
    .withMessage('Invalid employee role assignment'),
  body('designation').notEmpty().withMessage('Designation is required').trim(),
  body('salary').isNumeric().withMessage('Salary must be a numerical figure'),
  body('joiningDate').optional().isISO8601().withMessage('Invalid date format'),
];

const departmentValidator = [
  body('name').notEmpty().withMessage('Department name is required').trim(),
  body('description').optional().trim(),
  body('manager').optional().isMongoId().withMessage('Invalid manager User ID reference'),
];

const projectValidator = [
  body('name').notEmpty().withMessage('Project name is required').trim(),
  body('description').optional().trim(),
  body('manager').isMongoId().withMessage('Invalid manager User ID reference'),
  body('startDate').isISO8601().withMessage('Start date must be a valid ISO timestamp'),
  body('endDate').isISO8601().withMessage('End date must be a valid ISO timestamp'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
];

const taskValidator = [
  body('title').notEmpty().withMessage('Task title is required').trim(),
  body('description').optional().trim(),
  body('project').isMongoId().withMessage('Invalid Project ID reference'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid User ID reference'),
  body('deadline').isISO8601().withMessage('Deadline must be a valid ISO timestamp'),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('estimatedTime').optional().isNumeric().withMessage('Estimated time must be a number'),
];

const leaveValidator = [
  body('leaveType')
    .isIn(['Casual Leave', 'Medical Leave', 'Emergency Leave', 'Work From Home', 'Half Day'])
    .withMessage('Invalid leave type selection'),
  body('startDate').isISO8601().withMessage('Start date must be a valid ISO timestamp'),
  body('endDate').isISO8601().withMessage('End date must be a valid ISO timestamp'),
  body('reason').notEmpty().withMessage('Reason for leave is required').trim(),
];

module.exports = {
  registerValidator,
  loginValidator,
  employeeValidator,
  departmentValidator,
  projectValidator,
  taskValidator,
  leaveValidator,
};
