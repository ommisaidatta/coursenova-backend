const {
  enrollCourse,
  getMyEnrollments,
} = require("../controllers/enrollController");

const Enrollment = require("../models/enrollment");
const Lesson = require("../models/lesson");
const CourseProgress = require("../models/progress");

jest.mock("../models/enrollment");
jest.mock("../models/lesson");
jest.mock("../models/progress");

describe("Enroll Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { courseId: "course123" },
      user: { id: "user123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===============================
  // enrollCourse Tests
  // ===============================

  describe("enrollCourse", () => {
    test("should return 400 if already enrolled", async () => {
      Enrollment.findOne.mockResolvedValue({ _id: "existingEnroll" });

      await enrollCourse(req, res);

      expect(Enrollment.findOne).toHaveBeenCalledWith({
        user: "user123",
        course: "course123",
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Already enrolled",
      });
    });

    test("should enroll successfully", async () => {
      Enrollment.findOne.mockResolvedValue(null);

      Enrollment.create.mockResolvedValue({
        _id: "newEnroll",
        user: "user123",
        course: "course123",
      });

      await enrollCourse(req, res);

      expect(Enrollment.create).toHaveBeenCalledWith({
        user: "user123",
        course: "course123",
        progress: 0,
        status: "Active",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Course enrolled successfully",
        enrollment: expect.any(Object),
      });
    });

    test("should return 500 if error occurs", async () => {
      Enrollment.findOne.mockRejectedValue(new Error("DB Error"));

      await enrollCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Enrollment failed",
      });
    });
  });

  // ===============================
  // getMyEnrollments Tests
  // ===============================

  describe("getMyEnrollments", () => {
    beforeEach(() => {
      req = {
        user: { id: "user123" },
      };
    });

    test("should return empty array if no enrollments", async () => {
      Enrollment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      await getMyEnrollments(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("should calculate progress correctly (partial progress)", async () => {
      const mockEnrollment = {
        _id: "enroll1",
        course: { _id: "course123" },
        status: "Active",
        toObject: function () {
          return {
            _id: this._id,
            course: this.course,
            status: this.status,
          };
        },
      };

      Enrollment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockEnrollment]),
      });

      Lesson.countDocuments.mockResolvedValue(4);

      CourseProgress.findOne.mockResolvedValue({
        completedLessons: ["l1", "l2"], // 2 out of 4
      });

      await getMyEnrollments(req, res);

      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          progress: 50,
          status: "Active",
        }),
      ]);
    });

    test("should mark status as Completed if progress is 100%", async () => {
      const mockEnrollment = {
        _id: "enroll1",
        course: { _id: "course123" },
        status: "Active",
        toObject: function () {
          return {
            _id: this._id,
            course: this.course,
            status: this.status,
          };
        },
      };

      Enrollment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockEnrollment]),
      });

      Lesson.countDocuments.mockResolvedValue(2);

      CourseProgress.findOne.mockResolvedValue({
        completedLessons: ["l1", "l2"], // 2 of 2
      });

      await getMyEnrollments(req, res);

      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          progress: 100,
          status: "Completed",
        }),
      ]);
    });

    test("should return 500 if error occurs", async () => {
      Enrollment.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await getMyEnrollments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch enrollments",
      });
    });
  });
});
