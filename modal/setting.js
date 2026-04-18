const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'admin'
  },

  // Margin
  defaultMargin: {
    type: Number,
    default: 0
  },

  // Delivery
  deliveryCharge: {
    type: Number,
    default: 0
  },
  freeDeliveryAbove: {
    type: Number,
    default: 0
  },

  // App
  appActive: {
    type: Boolean,
    default: true
  },

  allowOrder: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);