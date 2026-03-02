jest.mock("../models/lesson");

const Lesson = require("../models/lesson");

const {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");

describe("Lesson Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        courseId: "course123",
        title: "Lesson 1",
        order: 1,
        contentBlocks: [{ type: "text", content: "Hello" }],
      },
      params: {
        courseId: "course123",
        lessonId: "lesson123",
      },
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
  // createLesson
  // =========================

  describe("createLesson", () => {
    test("should return 400 if required fields missing", async () => {
      req.body = {};

      await createLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should create lesson successfully", async () => {
      Lesson.create.mockResolvedValue({ _id: "lesson123" });

      await createLesson(req, res);

      expect(Lesson.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should return 500 on error", async () => {
      Lesson.create.mockRejectedValue(new Error("DB error"));

      await createLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // getLessonsByCourse
  // =========================

  describe("getLessonsByCourse", () => {
    test("should return lessons sorted", async () => {
      const mockLessons = [{ title: "Lesson 1" }];

      Lesson.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockLessons),
        }),
      });

      await getLessonsByCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockLessons);
    });

    test("should return 500 on error", async () => {
      Lesson.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await getLessonsByCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // getLessonById
  // =========================

  describe("getLessonById", () => {
    test("should return lesson if found", async () => {
      Lesson.findById.mockResolvedValue({ _id: "lesson123" });

      await getLessonById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return 404 if not found", async () => {
      Lesson.findById.mockResolvedValue(null);

      await getLessonById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 500 on error", async () => {
      Lesson.findById.mockRejectedValue(new Error("DB error"));

      await getLessonById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // updateLesson
  // =========================

  describe("updateLesson", () => {
    test("should update lesson successfully", async () => {
      Lesson.findByIdAndUpdate.mockResolvedValue({ _id: "lesson123" });

      await updateLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return 404 if lesson not found", async () => {
      Lesson.findByIdAndUpdate.mockResolvedValue(null);

      await updateLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 500 on error", async () => {
      Lesson.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

      await updateLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // deleteLesson
  // =========================

  describe("deleteLesson", () => {
    test("should delete lesson successfully", async () => {
      Lesson.findByIdAndDelete.mockResolvedValue({ _id: "lesson123" });

      await deleteLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return 404 if lesson not found", async () => {
      Lesson.findByIdAndDelete.mockResolvedValue(null);

      await deleteLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 500 on error", async () => {
      Lesson.findByIdAndDelete.mockRejectedValue(new Error("DB error"));

      await deleteLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
