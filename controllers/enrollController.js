const Enrollment = require("../models/enrollment");
const CourseProgress = require("../models/progress");
const Lesson = require("../models/lesson");

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id; // from JWT middleware

    const alreadyEnrolled = await Enrollment.findOne({
      user: userId,
      course: courseId,
    }).lean();

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      progress: 0,
      status: "Active",
    });

    res.status(201).json({
      message: "Course enrolled successfully",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: "Enrollment failed" });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.find({
      user: userId,
    })
      .populate("course")
      .lean();

    if (!enrollments.length) {
      return res.json([]);
    }

    const courseIds = enrollments.map((e) => e.course._id);

    const lessonsCounts = await Lesson.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: "$course", totalLessons: { $sum: 1 } } },
    ]);

    const lessonsMap = {};
    lessonsCounts.forEach((l) => {
      lessonsMap[l._id.toString()] = l.totalLessons;
    });

    const progressDocs = await CourseProgress.find({
      userId,
      courseId: { $in: courseIds },
    }).lean();

    const progressMap = {};
    progressDocs.forEach((p) => {
      progressMap[p.courseId.toString()] = p;
    });

    const result = enrollments.map((enrollment) => {
      const courseId = enrollment.course._id.toString();

      const totalLessons = lessonsMap[courseId] || 0;

      const completedCount =
        progressMap[courseId]?.completedLessons?.length || 0;

      const progress =
        totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

      return {
        ...enrollment,
        progress,
        status: progress === 100 ? "Completed" : enrollment.status,
      };
    });

    return res.json(result);
  } catch (error) {
    // console.error("Get enrollments error:", error);
    return res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};
