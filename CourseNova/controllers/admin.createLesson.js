const Lesson = require("../models/lesson");
const Course = require("../models/course");

exports.createLesson = async (req, res) => {
  try {
    const { title, content, videoUrl } = req.body;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lesson = await Lesson.create({
      title,
      content,
      videoUrl,
      course: courseId,
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
