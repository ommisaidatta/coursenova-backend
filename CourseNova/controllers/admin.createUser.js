const Student = require("../models/student");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({
        message: "First name, last name, email and password are required",
      });
    }

    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedRole =
      role && ["student", "admin"].includes(role) ? role : "student";

    const user = await Student.create({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: "0000000000",
      address: "—",
      gender: "male",
      role: normalizedRole,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    // console.error("Create user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
