const Course = require("../models/course");

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();

    res.status(200).json({
      totalCourses: courses.length,
      courses,
    });
  } catch (error) {
    // console.error("Get all courses error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
