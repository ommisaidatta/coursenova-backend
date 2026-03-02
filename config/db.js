const mongoose = require("mongoose");

const connectDB = async (url = process.env.MONGO_URL) => {
  try {
    await mongoose.connect(url, {
      maxPoolSize: 100,
      minPoolSize: 10,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
