const userModel = require('../modal/userAccess');
const loginUserModel = require('../modal/user');
const bcrypt = require('bcrypt');
const Shop = require('../modal/shopmanage');
const jwt = require('jsonwebtoken');
//const users = require('../models/user');



exports.addUser = async (req, res) => {
  try {
    const { name, userID, password, contact, role } = req.body;

    if (!name || !userID || !password || !contact || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory'
      });
    }

    const exist = await userModel.findOne({ userID });
    if (exist) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new userModel({
      name,
      userID,
      password: hashedPassword, // 🔥 correct field
      contact,
      role
    });

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'User Added',
      data: userObj
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {

    const userID = req.body.userID.toLowerCase();
    const password = req.body.password;

    // ✅ Validate input
    if (!userID || !password) {
      return res.status(400).json({
        success: false,
        message: 'UserID and password required'
      });
    }

    // 🔍 Find user
    const user = await userModel.findOne({ userID });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // ✅ Convert to plain object FIRST
    const userObj = user.toObject();

    // 🔥 Remove sensitive data
    delete userObj.password;

    // 🔥 Attach shops (ONLY for seller)
    if (user.role === 'seller') {
      const shops_details = await Shop.find({ owner: user._id });

      userObj.shops_details = shops_details;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );

    // ✅ Final response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// GET
exports.getUser = async (req, res) => {
  const users = await userModel.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: users
  });
};

// UPDATE
exports.updateUser = async (req, res) => {
  await userModel.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Updated'
  });
};

// DELETE
exports.deleteUser = async (req, res) => {
  await userModel.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Deleted'
  });
};


exports.loginUser = async (req, res) => {
  const phone = req.body.phone;
  const user = await loginUserModel.findOneAndUpdate(
    { phone: phone }, // find condition
    {
      $set: { lastLoginAt: new Date() },       // always update
      $setOnInsert: { createdAt: new Date() }  // only if new user
    },
    {
      new: true,
      upsert: true
    }
  );

  const token = jwt.sign(
    { id: user._id, role: user.role || 'user' },
    process.env.JWT_SECRET || 'mysecretkey',
    { expiresIn: '7d' }
  );
  res.json({
    success: true,
    token,
    user
  })
}

exports.updateLoggeINUserProfile = async (req, res) => {
  try {

    const userId = req.body._id; // or req.params.id
    const updateData = {
      name: req.body.name,
      phone: req.body.phone || req.body.phone,
      email: req.body.email,
      dob: req.body.dob,
      address: req.body.address,
      gender: req.body.gender
    };

    const updatedUser = await loginUserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Update Profile Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

// POST /add-address/:userId

exports.addPrefferedAddress = async (req, res) => {
  try {
    const userId = req.params.id;
    const addressData = req.body;

    const updatedUser = await loginUserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          preferredAddress: addressData
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving address' });
  }
}

// DELETE ADDRESS
exports.removeAddress = async (req, res) => {
  try {

    const userId = req.params.id;
    const addressId = req.body.address;

    const user = await loginUserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ✅ remove using _id
    user.preferredAddress = user.preferredAddress.filter(
      addr => addr._id.toString() !== addressId
    );

    await user.save();

    res.json({
      success: true,
      data: user
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.savetoken = async (req, res) => {
  const { userId, token } = req.body;

  await userModel.findByIdAndUpdate(userId, {
    fcmToken: token
  });

  res.json({ success: true });
};

// 🔹 Check Merchant
exports.checkMerchant = async (req, res) => {
  try {
    const { userId } = req.query;

console.log('userId',userId);
    const user = await userModel.findOne({ userID: userId });

    return res.json({ exists: !!user });

  } catch (err) {
    return res.status(500).json({ exists: false });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('userId:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const user = await userModel.findOne({ userID: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save(); // ✅ FIXED

    console.log("OTP:", otp);

    res.json({ message: 'OTP sent' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    console.log('BODY:', req.body);

    if (!userId || !otp) {
      return res.status(400).json({ valid: false, message: 'userId & otp required' });
    }

    const user = await userModel.findOne({ userID: userId });

    if (!user) {
      return res.status(404).json({ valid: false, message: 'User not found' });
    }

    // ❌ OTP mismatch
    if (user.otp !== otp) {
      return res.json({ valid: false, message: 'Invalid OTP' });
    }

    // ❌ OTP expired
    if (!user.otpExpiry || Date.now() > user.otpExpiry) {
      return res.json({ valid: false, message: 'OTP expired' });
    }

    // ✅ Success
    return res.json({ valid: true });

  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ valid: false, message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    console.log('BODY:', req.body);

    if (!userId || !password) {
      return res.status(400).json({ message: 'userId & password required' });
    }

    const user = await userModel.findOne({ userID: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    // 🔥 clear OTP after success
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.json({ message: 'Password updated successfully' });

  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};