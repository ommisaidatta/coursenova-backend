const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getAllCourses } = require("../controllers/admin.allCourses");

// List all courses - any authenticated user (student or admin)
router.get("/", authMiddleware, getAllCourses);

module.exports = router;
