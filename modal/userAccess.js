const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  userID: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  contact: String,
  fcmToken: String,
  role: {
    type: String,
    enum: ['admin', 'seller', 'delivery']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);