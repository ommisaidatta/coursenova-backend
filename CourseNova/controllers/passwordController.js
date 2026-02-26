const Student = require("../models/student");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const student = await Student.findOne({ email });

  if (!student) return res.status(404).json({ message: "Email not found" });

  const resetToken = crypto.randomBytes(32).toString("hex");

  student.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  student.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await student.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail(
    student.email,
    "Password Reset",
    `Reset your password here: ${resetUrl}`,
  );

  res.json({ message: "Reset link sent to email" });
};

exports.resetPassword = async (req, res) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const student = await Student.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!student)
    return res.status(400).json({ message: "Invalid or expired token" });

  student.password = await bcrypt.hash(req.body.password, 10);
  student.resetPasswordToken = undefined;
  student.resetPasswordExpire = undefined;
  await student.save();

  res.json({ message: "Password reset successful" });
};
