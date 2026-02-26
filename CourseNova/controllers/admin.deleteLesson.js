const Lesson = require("../models/lesson");

exports.deleteLesson = async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.lessonId);

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
