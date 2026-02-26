const User = require("../models/student");
const Enrollment = require("../models/enrollment");
const bcrypt = require("bcryptjs");

// Get My Profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrollments = await Enrollment.find({
      user: userId,
    });

    res.json({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      address: user.address,
      totalEnrollments: enrollments.length,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Update Profile
exports.updateMyProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        gender: req.body.gender,
        address: req.body.address,
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Student not found" });
    }

    const totalEnrollments = await Enrollment.countDocuments({
      user: updatedUser._id,
    });

    res.json({
      _id: updatedUser._id,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      email: updatedUser.email,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      address: updatedUser.address,
      totalEnrollments,
    });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

// Update Password
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
