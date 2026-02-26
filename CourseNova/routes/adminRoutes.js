const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { dashboardSummary } = require("../controllers/admin.dashboard");

const { getUserById } = require("../controllers/admin.getUser");
const { deleteUser } = require("../controllers/admin.deleteUser");
const { changeUserRole } = require("../controllers/admin.changeUserRole");

const { createCourse } = require("../controllers/admin.createCourse");
const { updateCourse } = require("../controllers/admin.updateCourse");
const { deleteCourse } = require("../controllers/admin.deleteCourse");
const { getAllCourses } = require("../controllers/admin.allCourses");
const { viewAllUsers } = require("../controllers/admin.viewUser");
const { createUser } = require("../controllers/admin.createUser");

const { createLesson } = require("../controllers/admin.createLesson");
const { updateLesson } = require("../controllers/admin.updateLesson");
const { deleteLesson } = require("../controllers/admin.deleteLesson");

router.get("/users", authMiddleware, adminMiddleware, viewAllUsers);
router.post("/users", authMiddleware, adminMiddleware, createUser);

router.get("/dashboard", authMiddleware, adminMiddleware, dashboardSummary);

router.get("/users/:id", authMiddleware, adminMiddleware, getUserById);

router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

router.patch(
  "/users/:id/role",
  authMiddleware,
  adminMiddleware,
  changeUserRole,
);

router.post("/courses", authMiddleware, adminMiddleware, createCourse);

router.put("/courses/:id", authMiddleware, adminMiddleware, updateCourse);

router.delete("/courses/:id", authMiddleware, adminMiddleware, deleteCourse);

router.get("/courses", authMiddleware, adminMiddleware, getAllCourses);

router.post(
  "/courses/:courseId/lessons",
  authMiddleware,
  adminMiddleware,
  createLesson,
);

router.put("/lessons/:lessonId", authMiddleware, adminMiddleware, updateLesson);

router.delete(
  "/lessons/:lessonId",
  authMiddleware,
  adminMiddleware,
  deleteLesson,
);

module.exports = router;
