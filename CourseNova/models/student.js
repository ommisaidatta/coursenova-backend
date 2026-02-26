const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    resetPasswordToken: { type: String },

    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Student", studentSchema);
