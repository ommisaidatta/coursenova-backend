const Lesson = require("../models/lesson");

exports.createLesson = async (req, res) => {
  try {
    const { courseId, course, title, order, contentBlocks } = req.body;

    const courseRef = courseId || course;

    if (!courseRef || !title || order === undefined || !contentBlocks?.length) {
      return res.status(400).json({
        message: "courseId, title, order and contentBlocks are required",
      });
    }

    const lesson = await Lesson.create({
      course: courseRef,
      title,
      order,
      contentBlocks,
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    // console.error("Create lesson error:", error);
    res.status(500).json({ message: "Failed to create lesson" });
  }
};

exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.find({ course: courseId })
      .sort({ order: 1 })
      .lean();

    res.status(200).json(lessons);
  } catch (error) {
    // console.error("Get lessons error:", error);
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json(lesson);
  } catch (error) {
    // console.error("Get lesson error:", error);
    res.status(500).json({ message: "Failed to fetch lesson" });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, order, contentBlocks } = req.body;

    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { title, order, contentBlocks },
      { new: true, runValidators: true },
    );

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json({
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (error) {
    // console.error("Update lesson error:", error);
    res.status(500).json({ message: "Failed to update lesson" });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    // console.error("Delete lesson error:", error);
    res.status(500).json({ message: "Failed to delete lesson" });
  }
};
