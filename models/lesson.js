const mongoose = require("mongoose");

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "video", "link", "example"],
      required: true,
    },

    text: {
      type: String,
      trim: true,
    },

    video: {
      title: { type: String, trim: true },
      url: { type: String, trim: true },
    },

    link: {
      title: { type: String, trim: true },
      url: { type: String, trim: true },
    },

    example: {
      text: { type: String },
    },
  },
  { _id: false },
);

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
    },

    contentBlocks: {
      type: [contentBlockSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Lesson must have at least one content block",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lesson", lessonSchema);
