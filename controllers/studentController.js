const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const user = require("../models/student");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "58221825fd2a7930b41a5783b42df07d969351d8041d14bbd0878c54b7be40a1da77b2debfaa5abfa6dd44001b709d89f281562ae488daf765dcaf1ca9834cb2";

const registerStudent = async (req, res) => {
  try {
    // console.log("Full Details:", req.body);
    const { firstname, lastname, email, password, phone, address, gender } =
      req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !gender
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      firstname,
      lastname,
      email,
      password: hashPassword,
      phone,
      address,
      gender,
    });

    // console.log("Saving to MongoDB...");
    const savedStudent = await student.save();
    // console.log("SAVED! ID:", savedStudent._id);

    return res.status(201).json({
      message: "Student registered successfully",
      id: savedStudent._id,
      email: savedStudent.email,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Ensure role exists, default to "student" for old users
    const userRole = student.role || "student";

    const accessToken = jwt.sign(
      {
        id: student._id,
        email: student.email,
        role: userRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { id: student._id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "90d",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      role: userRole,
    });
  } catch (error) {
    // console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 🔥 Fetch user again to get role
    const student = await Student.findById(decoded.id);

    if (!student) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure role exists, default to "student" for old users
    const userRole = student.role || "student";

    const newAccessToken = jwt.sign(
      {
        id: student._id,
        email: student.email,
        role: userRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ accessToken: newAccessToken, role: userRole });
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

module.exports = { registerStudent, loginStudent, refreshAccessToken, logout };
