const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
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

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    review: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

ratingSchema.index({ user: 1, course: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
