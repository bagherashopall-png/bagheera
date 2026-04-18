const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ DB Error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };