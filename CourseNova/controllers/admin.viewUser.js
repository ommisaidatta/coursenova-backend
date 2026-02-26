const User = require("../models/student");

exports.viewAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      totalUsers: users.length,
      users: users,
    });
  } catch (error) {
    // console.error("Get all users error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
