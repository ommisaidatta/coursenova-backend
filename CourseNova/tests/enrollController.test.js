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
      Enrollment.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: "existingEnroll" }),
      });
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
      Enrollment.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

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
      Enrollment.findOne.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("DB Error")),
      });

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
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });

      await getMyEnrollments(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("should calculate progress correctly (partial progress)", async () => {
      Enrollment.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            {
              _id: "enroll1",
              course: { _id: "course123" },
              status: "Active",
            },
          ]),
        }),
      });

      Lesson.aggregate.mockResolvedValue([
        { _id: "course123", totalLessons: 4 },
      ]);

      CourseProgress.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            courseId: "course123",
            completedLessons: ["l1", "l2"],
          },
        ]),
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
      Enrollment.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            {
              _id: "enroll1",
              course: { _id: "course123" },
              status: "Active",
            },
          ]),
        }),
      });

      Lesson.aggregate.mockResolvedValue([
        { _id: "course123", totalLessons: 2 },
      ]);

      CourseProgress.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            courseId: "course123",
            completedLessons: ["l1", "l2"],
          },
        ]),
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
      Enrollment.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      });

      await getMyEnrollments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch enrollments",
      });
    });
  });
});
