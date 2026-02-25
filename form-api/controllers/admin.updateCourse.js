const Course = require("../models/course");

exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const { title, description, category, duration, level, isActive } =
      req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (duration) course.duration = duration;
    if (level) course.level = level;
    if (typeof isActive === "boolean") course.isActive = isActive;

    const updateCourse = await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      course: updateCourse,
    });
  } catch (error) {
    // console.error("Update course error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
