const Course = require("../models/course");

exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    // console.error("Delete course error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
