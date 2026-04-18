const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({

  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shops',
    required: true,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },

  itemName: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  minQty: {
    type: Number,
    default: 1
  },

  image: {
    type: String,
    default: ''
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('menus', menuSchema);