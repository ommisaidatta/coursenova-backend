const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getProgress,
  completeLesson,
} = require("../controllers/progressController");

router.get("/:courseId", auth, getProgress);
router.post("/complete", auth, completeLesson);

module.exports = router;
