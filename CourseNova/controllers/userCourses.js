exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.find({ user: userId })
      .populate("course")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};
