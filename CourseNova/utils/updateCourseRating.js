const Review = require("../models/reviewModel");
const Course = require("../models/courseModel");

const updateCourseRating = async (courseId) => {
  const stats = await Review.aggregate([
    {
      $match: { courseId: courseId },
    },
    {
      $group: {
        _id: "$courseId",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: stats[0].avgRating,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

module.exports = updateCourseRating;
