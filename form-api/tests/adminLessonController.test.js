jest.mock("../models/lesson");
jest.mock("../models/course");

const Lesson = require("../models/lesson");
const Course = require("../models/course");

const { createLesson } = require("../controllers/admin.createLesson");
const { deleteLesson } = require("../controllers/admin.deleteLesson");
const { updateLesson } = require("../controllers/admin.updateLesson");

describe("Admin Lesson Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // CREATE LESSON
  // =========================
  describe("createLesson", () => {
    test("should return 404 if course not found", async () => {
      req.params.courseId = "course123";

      Course.findById.mockResolvedValue(null);

      await createLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Course not found",
      });
    });

    test("should create lesson successfully", async () => {
      req.params.courseId = "course123";
      req.body = {
        title: "Intro",
        content: "Basics",
        videoUrl: "video.mp4",
      };

      Course.findById.mockResolvedValue({ _id: "course123" });
      Lesson.create.mockResolvedValue({
        title: "Intro",
      });

      await createLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lesson created successfully",
        lesson: { title: "Intro" },
      });
    });

    test("should return 500 on error", async () => {
      Course.findById.mockRejectedValue(new Error());

      await createLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // DELETE LESSON
  // =========================
  describe("deleteLesson", () => {
    test("should delete lesson successfully", async () => {
      req.params.lessonId = "lesson123";

      Lesson.findByIdAndDelete.mockResolvedValue({});

      await deleteLesson(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Lesson deleted successfully",
      });
    });

    test("should return 500 on error", async () => {
      Lesson.findByIdAndDelete.mockRejectedValue(new Error());

      await deleteLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // UPDATE LESSON
  // =========================
  describe("updateLesson", () => {
    test("should return 404 if lesson not found", async () => {
      req.params.lessonId = "lesson123";

      Lesson.findByIdAndUpdate.mockResolvedValue(null);

      await updateLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lesson not found",
      });
    });

    test("should update lesson successfully", async () => {
      req.params.lessonId = "lesson123";
      req.body = { title: "Updated" };

      Lesson.findByIdAndUpdate.mockResolvedValue({
        title: "Updated",
      });

      await updateLesson(req, res);

      expect(res.json).toHaveBeenCalledWith({
        title: "Updated",
      });
    });

    test("should return 500 on error", async () => {
      Lesson.findByIdAndUpdate.mockRejectedValue(new Error());

      await updateLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
