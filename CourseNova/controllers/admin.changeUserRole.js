const Student = require("../models/student");

exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await Student.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
