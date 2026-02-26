const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    certificateId: {
      type: String,
      required: true,
      unique: true,
    },

    courseDuration: {
      type: String,
    },

    issuedDate: {
      type: Date,
      default: Date.now,
    },

    certificateUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Certificate", certificateSchema);
