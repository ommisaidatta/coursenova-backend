const Rating = require("../models/rating");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const CourseProgress = require("../models/progress");
const Lesson = require("../models/lesson");

exports.addOrUpdateReview = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user.id;

    // Ensure user is enrolled
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course",
      });
    }

    // console.log("Enrollment progress:", enrollment?.progress);
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const courseProgress = await CourseProgress.findOne({ userId, courseId });
    const completedCount = courseProgress
      ? courseProgress.completedLessons.length
      : 0;

    const progress =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    if (progress < 100) {
      return res.status(403).json({
        message: "Complete course before rating",
      });
    }
    // console.log("Total lessons:", totalLessons);
    // console.log("Course progress doc:", courseProgress);
    // console.log(
    //   "Completed lessons count:",
    //   courseProgress?.completedLessons?.length,
    // );

    // Check Existing Rating
    let existingRating = await Rating.findOne({
      user: userId,
      course: courseId,
    });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();
    } else {
      await Rating.create({
        user: userId,
        course: courseId,
        rating,
        review,
      });
    }

    // Recalculate Average
    const ratings = await Rating.find({ course: courseId });

    const totalReviews = ratings.length;

    const avg =
      totalReviews === 0
        ? 0
        : ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await Course.findByIdAndUpdate(courseId, {
      averageRating: Number(avg.toFixed(1)),
      totalReviews,
    });

    res.json({
      message: "Rating saved successfully",
    });
  } catch (error) {
    // console.error("Rating error:", error);
    res.status(500).json({ message: "Rating failed" });
  }
};

// GET /api/rating/:courseId
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await Rating.find({ course: courseId })
      .populate("user", "firstname lastname email")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    return res.json({
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      reviews,
    });
  } catch (error) {
    // console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// GET /api/rating/my
exports.getMyRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    const ratings = await Rating.find({ user: userId })
      .select("course rating review updatedAt createdAt")
      .lean();

    return res.json(ratings);
  } catch (error) {
    // console.error("Get my ratings error:", error);
    res.status(500).json({ message: "Failed to fetch my ratings" });
  }
};
