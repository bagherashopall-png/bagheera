const mongoose = require('mongoose');

const uri = "mongodb+srv://deepakagrawal2309_db_user:9yRtmmADY5qWfVrv@manasa.dch7p2x.mongodb.net/foodapp?retryWrites=true&w=majority";

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