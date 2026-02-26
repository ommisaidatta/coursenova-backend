const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  },
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

enrollmentSchema.pre("save", function (next) {
  if (this.progress === 100) {
    this.status = "Completed";
  }
  next();
});

module.exports = mongoose.model("Enrollment", enrollmentSchema);
