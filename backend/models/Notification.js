const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'TaskAssigned',
        'LeaveApproved',
        'LeaveRejected',
        'AttendanceReminder',
        'ProjectUpdate',
        'Mention',
        'NewMessage',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // Routing URL in the frontend app
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
