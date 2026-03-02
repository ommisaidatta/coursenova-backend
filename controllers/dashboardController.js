const Enrollment = require("../models/enrollment");
const Rating = require("../models/rating");

const { getDashboardStats } = require("../controllers/dashboardController");

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrolledCount = await Enrollment.countDocuments({
      user: userId,
    });

    const ratings = await Rating.find({ user: userId });
    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
    res.json({
      enrolledCourses: enrolledCount,
      averageRating: avgRating.toFixed(1),
    });
  } catch (error) {
    res.status(500).json({ message: "Stats fetch failed" });
  }
};
