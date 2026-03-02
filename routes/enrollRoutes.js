const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  enrollCourse,
  getMyEnrollments,
} = require("../controllers/enrollController");
const {
  getEnrollmentsByUserId,
} = require("../controllers/admin.enrolledBy.user");

router.post("/", auth, enrollCourse);

router.get("/my", auth, getMyEnrollments);

router.get("/user/:userId", getEnrollmentsByUserId);

module.exports = router;
