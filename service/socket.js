const Message = require('../models/Messaage');
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');

function initSocketIO(io) {
  io.on('connection', (socket) => {

    const originalEmit = socket.emit;
    socket.emit = function(event, ...args) {
      return originalEmit.apply(socket, [event, ...args]);
    };

    socket.on('registerUser', async (userId) => {
      try {
      
        const user = await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id
        }, { new: true }).populate('friends', 'socketId');
        
        user.friends.forEach(friend => {
          if (friend.socketId) {
            io.to(friend.socketId).emit('friendStatusChange', {
              userId: user._id,
              isOnline: true
            });
          }
        });
      } catch (err) {
      }
    });

    socket.on('joinRoom', (roomName) => {
      socket.join(roomName);
    });

    socket.on('typing', ({ roomName, username }) => {
      socket.to(roomName).emit('typing', username);
    });

    socket.on('stopTyping', ({ roomName }) => {
      socket.to(roomName).emit('stopTyping');
    });

    socket.on('sendMessage', async ({ roomName, senderId, content }) => {
      try {
        const room = await ChatRoom.findOne({ roomName });
        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        const message = await Message.create({
          room: room._id,
          sender: senderId,
          content,
          timestamp: new Date()
        });

        const populatedMsg = await Message.findById(message._id)
          .populate('sender', 'username avatar');

        
       socket.to(roomName).emit('receiveMessage', {
          ...populatedMsg.toObject(),
          room: { 
              _id: room._id,
              roomName: room.roomName
          }
        });

        room.lastMessage = new Date();
        await room.save();

      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', async () => {
      try {
        const user = await User.findOne({ socketId: socket.id });
        if (user) {
          user.isOnline = false;
          user.socketId = null;
          await user.save();

          const populatedUser = await User.findById(user._id).populate('friends', 'socketId');
          populatedUser.friends.forEach(friend => {
            if (friend.socketId) {
              console.log(`📢 Notifying friend ${friend._id} about offline status`);
              io.to(friend.socketId).emit('friendStatusChange', {
                userId: user._id,
                isOnline: false
              });
            }
          });
        }
      } catch (err) {
      }
    });

    socket.emit('connection-success', { 
      message: 'Socket connected successfully',
      socketId: socket.id,
      timestamp: new Date()
    });
  });

}

module.exports = initSocketIO;