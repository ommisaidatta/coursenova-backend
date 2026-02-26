const Student = require("../models/student");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const Certificate = require("../models/certificateModel");

exports.dashboardSummary = async (req, res) => {
  try {
    const totalUsers = await Student.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCertificates,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
