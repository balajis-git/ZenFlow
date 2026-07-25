const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['Project', 'Task'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'entityType', // dynamically references Project or Task
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
