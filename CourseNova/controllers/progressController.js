const CourseProgress = require("../models/progress");
const Certificate = require("../models/certificateModel");
const { v4: uuidv4 } = require("uuid");
const generateCertificatePDF = require("../utils/certificateGenerator");
const Student = require("../models/student");
const Course = require("../models/course");
const Lesson = require("../models/lesson");

exports.getProgress = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  const progress = await CourseProgress.findOne({ userId, courseId });

  const completedLessons = progress
    ? progress.completedLessons.map((id) => id.toString())
    : [];

  res.json({ completedLessons });
};

exports.completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const userId = req.user.id;

    let progress = await CourseProgress.findOne({ userId, courseId });

    const alreadyCompleted = progress?.completedLessons.some(
      (id) => id.toString() === lessonId,
    );

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        completedLessons: [lessonId],
      });
    } else if (!alreadyCompleted) {
      progress.completedLessons.push(lessonId);
      await progress.save();
    }

    const totalLessons = await Lesson.countDocuments({ courseId });

    const completedCount = progress.completedLessons.length;

    const progressPercentage =
      totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    // CERTIFICATE GENERATION
    if (progressPercentage >= 100) {
      const existingCertificate = await Certificate.findOne({
        studentId: userId,
        courseId,
      });

      if (!existingCertificate) {
        const student = await Student.findById(userId);
        const course = await Course.findById(courseId);

        const certificateId = uuidv4();

        const fileName = await generateCertificatePDF({
          studentName: `${student.firstname} ${student.lastname}`,
          courseName: course.title,
          certificateId,
        });

        await Certificate.create({
          studentId: userId,
          courseId,
          certificateId,
          certificateUrl: `/certificates/${fileName}`,
        });
      }
    }

    const completedLessons = progress.completedLessons.map((id) =>
      id.toString(),
    );

    res.json({
      completedLessons,
      progressPercentage,
    });
  } catch (error) {
    // console.error("Progress Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
