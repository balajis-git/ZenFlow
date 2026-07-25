const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['private', 'group'],
      default: 'private',
    },
    name: {
      type: String,
      trim: true,
      default: null, // For group chats
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
