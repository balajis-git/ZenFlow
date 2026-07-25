const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    date: {
      type: String, // Stored as "YYYY-MM-DD" for easy local day queries
      required: true,
    },
    clockIn: {
      type: Date,
      required: true,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    breaks: [
      {
        start: {
          type: Date,
          required: true,
        },
        end: {
          type: Date,
          default: null,
        },
      },
    ],
    workingHours: {
      type: Number, // Total calculated working hours for the day
      default: 0,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half Day', 'Absent'],
      default: 'Present',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
