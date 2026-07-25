const express = require('express');
const router = express.Router();
const {
  getChats,
  createOrGetChat,
  createGroupChat,
  getMessages,
  markMessagesAsRead,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getChats);
router.post('/private', createOrGetChat);
router.post('/group', createGroupChat);
router.get('/:chatId/messages', getMessages);
router.patch('/:chatId/read', markMessagesAsRead);

module.exports = router;
