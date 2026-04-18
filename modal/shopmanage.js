const mongoose = require('mongoose');
const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  fssaiLic: {
    type: String,
    default: ''
  },
  place: { type: String, required: true },
  owner: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  openTime: {
    type: String  ,
    required: true // 🔥 better
  },
  closeTime: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  address:{ type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Shops', shopSchema);