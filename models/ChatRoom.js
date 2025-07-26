const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  roomName: { type: String, required: true, unique: true }, 
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
