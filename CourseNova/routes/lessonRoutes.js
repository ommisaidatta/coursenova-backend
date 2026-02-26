const express = require("express");
const router = express.Router();

const lessonController = require("../controllers/lessonController");

router.post("/", lessonController.createLesson);

router.get("/course/:courseId", lessonController.getLessonsByCourse);

router.get("/:lessonId", lessonController.getLessonById);

router.put("/:lessonId", lessonController.updateLesson);

router.delete("/:lessonId", lessonController.deleteLesson);

module.exports = router;
