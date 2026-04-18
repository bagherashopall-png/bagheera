const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: String,
  userId: String,
  items: Array,
  pricing: Object,
  address: Object,
  instructions: String,  payment: Object,
  shopID: String,
  shopName: String,
  orderStatus: {
    type: String,
    default: 'placed'
  },
  cancelReason: String,
  statusHistory: [
    {
      status: String,
      actionBy: {
        personID: String,
        name: String,
        role: String,
        shopName:String
      },
      time: Date
    }
  ],
  feedback: {
  rating: Number,
  review: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
},
  lastActionBy: {
    personID: String,
    name: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);