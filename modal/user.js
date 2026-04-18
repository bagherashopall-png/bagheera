const mongoose = require('mongoose');

const loginuserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: String,
  email: String,
  dob: { type: Date },
  address: { type: String },
  gender: { type: String },
  preferredAddress: [
    {
      name: String,
      mobile: String,
      street: String,
      city: String,
      state: String,
      postCode: String,
      town: String
    }
  ],
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('LoginUser', loginuserSchema);