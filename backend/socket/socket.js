const Message = require('../models/Message');
const Chat = require('../models/Chat');

const onlineUsers = new Map(); // Map of userId -> socket.id

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join user room for private notification delivery
    socket.on('setup', (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log(`[Socket] User ${userId} set up successfully.`);
      io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    });

    // Join a specific chat channel/room
    socket.on('joinChat', (room) => {
      socket.join(room);
      console.log(`[Socket] Socket joined chat room: ${room}`);
    });

    // Handle typing indicators
    socket.on('typing', (room) => {
      socket.in(room).emit('typing', room);
    });

    socket.on('stopTyping', (room) => {
      socket.in(room).emit('stopTyping', room);
    });

    // Handle sending message
    socket.on('newMessage', async (data) => {
      try {
        const { chat, sender, content, attachments } = data;

        // Save message to database
        const message = await Message.create({
          chat,
          sender,
          content,
          attachments: attachments || [],
        });

        // Populate sender info
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name profileImage email designation')
          .exec();

        // Update latest message in Chat model
        await Chat.findByIdAndUpdate(chat, { latestMessage: message._id });

        // Retrieve participants of the chat to broadcast
        const chatRoom = await Chat.findById(chat);
        if (chatRoom) {
          chatRoom.participants.forEach((userId) => {
            const recipientSocketId = onlineUsers.get(userId.toString());
            
            // Send to online participants (excluding sender)
            if (recipientSocketId && userId.toString() !== sender.toString()) {
              io.to(recipientSocketId).emit('messageReceived', populatedMessage);
            }
          });
        }

        // Send confirmation back to sender
        socket.emit('messageSent', populatedMessage);
      } catch (err) {
        console.error(`[Socket Message Error] ${err.message}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      
      // Find and remove from online user Map
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`[Socket] User ${userId} disconnected.`);
          break;
        }
      }
      
      io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

// Global helper to trigger push notification from anywhere on server
const sendRealTimeNotification = (io, recipientId, notification) => {
  const socketId = onlineUsers.get(recipientId.toString());
  if (socketId) {
    io.to(socketId).emit('notificationReceived', notification);
    console.log(`[Socket Notification] Delivered notification real-time to user ${recipientId}`);
  } else {
    console.log(`[Socket Notification] User ${recipientId} is offline. Notification saved to DB.`);
  }
};

module.exports = {
  initSocket,
  sendRealTimeNotification,
};
