const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all active chats for logged in user
// @route   GET /api/chats
// @access  Private
exports.getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name email designation profileImage status')
      .populate('groupAdmin', 'name')
      .populate({
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: 'name profileImage',
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or Fetch Private Chat
// @route   POST /api/chats/private
// @access  Private
exports.createOrGetChat = async (req, res, next) => {
  try {
    const { userId } = req.body; // target user ID

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Target userId is required' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      type: 'private',
      participants: { $all: [req.user._id, userId] },
    })
      .populate('participants', 'name email designation profileImage status')
      .populate('latestMessage');

    if (!chat) {
      chat = await Chat.create({
        type: 'private',
        participants: [req.user._id, userId],
      });
      chat = await Chat.findById(chat._id).populate('participants', 'name email designation profileImage status');
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Group Chat
// @route   POST /api/chats/group
// @access  Private
exports.createGroupChat = async (req, res, next) => {
  try {
    const { name, users } = req.body; // users: array of IDs

    if (!name || !users || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Group name and users list are required' });
    }

    const parsedUsers = typeof users === 'string' ? JSON.parse(users) : users;
    
    // Add current user to group
    const participants = [...parsedUsers, req.user._id];

    if (participants.length < 3) {
      return res.status(400).json({ success: false, message: 'Group chat requires at least 3 participants' });
    }

    const chat = await Chat.create({
      type: 'group',
      name,
      participants,
      groupAdmin: req.user._id,
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name email designation profileImage status')
      .populate('groupAdmin', 'name');

    res.status(201).json({
      success: true,
      chat: populatedChat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a chat ID
// @route   GET /api/chats/:chatId/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    // Verify participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages in this chat' });
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name email profileImage')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark chat messages as read
// @route   PATCH /api/chats/:chatId/read
// @access  Private
exports.markMessagesAsRead = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    await Message.updateMany(
      { chat: req.params.chatId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};
