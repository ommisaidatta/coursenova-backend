const {
  getProgress,
  completeLesson,
} = require("../controllers/progressController");

const CourseProgress = require("../models/progress");
const Certificate = require("../models/certificateModel");
const Student = require("../models/student");
const Course = require("../models/course");
const Lesson = require("../models/lesson");
const generateCertificatePDF = require("../utils/certificateGenerator");

jest.mock("../models/progress");
jest.mock("../models/certificateModel");
jest.mock("../models/student");
jest.mock("../models/course");
jest.mock("../models/lesson");
jest.mock("../utils/certificateGenerator");
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid"),
}));

describe("Progress Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
      params: { courseId: "course123" },
      body: { courseId: "course123", lessonId: "lesson1" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================
  // getProgress
  // ============================

  describe("getProgress", () => {
    test("should return empty array if no progress", async () => {
      CourseProgress.findOne.mockResolvedValue(null);

      await getProgress(req, res);

      expect(res.json).toHaveBeenCalledWith({ completedLessons: [] });
    });

    test("should return completed lessons as strings", async () => {
      CourseProgress.findOne.mockResolvedValue({
        completedLessons: [{ toString: () => "lesson1" }],
      });

      await getProgress(req, res);

      expect(res.json).toHaveBeenCalledWith({
        completedLessons: ["lesson1"],
      });
    });
  });

  // ============================
  // completeLesson
  // ============================

  describe("completeLesson", () => {
    test("should create progress if not exists", async () => {
      CourseProgress.findOne.mockResolvedValue(null);
      CourseProgress.create.mockResolvedValue({
        completedLessons: ["lesson1"],
      });

      Lesson.countDocuments.mockResolvedValue(4);
      Certificate.findOne.mockResolvedValue(null);

      await completeLesson(req, res);

      expect(CourseProgress.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          progressPercentage: 25,
        }),
      );
    });

    test("should add lesson if not already completed", async () => {
      const mockProgress = {
        completedLessons: ["lesson1"],
        save: jest.fn(),
      };

      CourseProgress.findOne.mockResolvedValue(mockProgress);

      req.body.lessonId = "lesson2";

      Lesson.countDocuments.mockResolvedValue(4);
      Certificate.findOne.mockResolvedValue(null);

      await completeLesson(req, res);

      expect(mockProgress.completedLessons).toContain("lesson2");
      expect(mockProgress.save).toHaveBeenCalled();
    });

    test("should not duplicate completed lesson", async () => {
      const mockProgress = {
        completedLessons: ["lesson1"],
        save: jest.fn(),
      };

      CourseProgress.findOne.mockResolvedValue(mockProgress);
      Lesson.countDocuments.mockResolvedValue(4);

      await completeLesson(req, res);

      expect(mockProgress.save).not.toHaveBeenCalled();
    });

    test("should generate certificate when progress is 100%", async () => {
      const mockProgress = {
        completedLessons: ["lesson1", "lesson2"],
        save: jest.fn(),
      };

      CourseProgress.findOne.mockResolvedValue(mockProgress);
      Lesson.countDocuments.mockResolvedValue(2);

      Certificate.findOne.mockResolvedValue(null);
      Student.findById.mockResolvedValue({
        firstname: "Sai",
        lastname: "Datta",
      });
      Course.findById.mockResolvedValue({
        title: "Node Course",
      });

      generateCertificatePDF.mockResolvedValue("file.pdf");

      await completeLesson(req, res);

      expect(generateCertificatePDF).toHaveBeenCalled();
      expect(Certificate.create).toHaveBeenCalled();
    });

    test("should not generate duplicate certificate", async () => {
      const mockProgress = {
        completedLessons: ["lesson1", "lesson2"],
        save: jest.fn(),
      };

      CourseProgress.findOne.mockResolvedValue(mockProgress);
      Lesson.countDocuments.mockResolvedValue(2);

      Certificate.findOne.mockResolvedValue({ _id: "existingCert" });

      await completeLesson(req, res);

      expect(Certificate.create).not.toHaveBeenCalled();
    });

    test("should return 500 on error", async () => {
      CourseProgress.findOne.mockRejectedValue(new Error("DB Error"));

      await completeLesson(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
      });
    });
  });
});
