const Course = require("../models/course");

exports.createCourse = async (req, res) => {
  try {
    const { title, category, duration, level } = req.body;

    if (!title || !duration) {
      return res.status(400).json({
        message: "Title and duration are required",
      });
    }

    const existingCourse = await Course.findOne({ title });
    if (existingCourse) {
      return res.status(409).json({
        message: "Course with this title already exists",
      });
    }

    const course = await Course.create({
      title: title.trim(),
      category: category || "",
      duration: duration.trim(),
      level: level || "Beginner",
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    // console.error("Create course error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
