const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  addOrUpdateReview,
  getCourseReviews,
  getMyRatings,
} = require("../controllers/ratingController");

router.post("/", auth, addOrUpdateReview);

router.get("/my", auth, getMyRatings);

router.get("/:courseId", getCourseReviews);

module.exports = router;
