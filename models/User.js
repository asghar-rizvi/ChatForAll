const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  passwordUpdatedAt: {
    type: Date
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  sentRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  pendingRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  isOnline: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    default: null
  },
  profileImage: {
    type: String,
    default: '/default/default.png' 
  },
  bio: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;