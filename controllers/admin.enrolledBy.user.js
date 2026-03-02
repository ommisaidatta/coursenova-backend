const Enrollment = require("../models/enrollment");

exports.getEnrollmentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await Enrollment.find({ user: userId }).populate(
      "course",
    );

    res.json({
      userId,
      totalEnrollments: enrollments.length,
      enrollments,
    });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};
