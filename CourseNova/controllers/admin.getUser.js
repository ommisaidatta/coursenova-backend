const Student = require("../models/student");

exports.getUserById = async (req, res) => {
  try {
    const user = await Student.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
