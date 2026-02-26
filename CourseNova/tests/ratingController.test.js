const {
  addOrUpdateReview,
  getCourseReviews,
  getMyRatings,
} = require("../controllers/ratingController");

const Rating = require("../models/rating");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const CourseProgress = require("../models/progress");
const Lesson = require("../models/lesson");

jest.mock("../models/rating");
jest.mock("../models/course");
jest.mock("../models/enrollment");
jest.mock("../models/progress");
jest.mock("../models/lesson");

describe("Rating Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
      body: {
        courseId: "course123",
        rating: 5,
        review: "Great course",
      },
      params: { courseId: "course123" },
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
  // addOrUpdateReview
  // =========================

  describe("addOrUpdateReview", () => {
    test("should return 403 if not enrolled", async () => {
      Enrollment.findOne.mockResolvedValue(null);

      await addOrUpdateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("should return 403 if course not completed", async () => {
      Enrollment.findOne.mockResolvedValue({ _id: "enroll1" });
      Lesson.countDocuments.mockResolvedValue(4);
      CourseProgress.findOne.mockResolvedValue({
        completedLessons: ["l1"], // 1/4 = 25%
      });

      await addOrUpdateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("should create new rating and recalc average", async () => {
      Enrollment.findOne.mockResolvedValue({ _id: "enroll1" });
      Lesson.countDocuments.mockResolvedValue(1);
      CourseProgress.findOne.mockResolvedValue({
        completedLessons: ["l1"], // 100%
      });

      Rating.findOne.mockResolvedValue(null);
      Rating.create.mockResolvedValue({});

      Rating.find.mockResolvedValue([{ rating: 5 }, { rating: 4 }]);

      await addOrUpdateReview(req, res);

      expect(Rating.create).toHaveBeenCalled();
      expect(Course.findByIdAndUpdate).toHaveBeenCalledWith(
        "course123",
        expect.objectContaining({
          averageRating: 4.5,
          totalReviews: 2,
        }),
      );

      expect(res.json).toHaveBeenCalledWith({
        message: "Rating saved successfully",
      });
    });

    test("should update existing rating", async () => {
      Enrollment.findOne.mockResolvedValue({ _id: "enroll1" });
      Lesson.countDocuments.mockResolvedValue(1);
      CourseProgress.findOne.mockResolvedValue({
        completedLessons: ["l1"],
      });

      const mockRating = {
        rating: 3,
        review: "Old",
        save: jest.fn(),
      };

      Rating.findOne.mockResolvedValue(mockRating);
      Rating.find.mockResolvedValue([{ rating: 5 }]);

      await addOrUpdateReview(req, res);

      expect(mockRating.save).toHaveBeenCalled();
    });

    test("should return 500 on error", async () => {
      Enrollment.findOne.mockRejectedValue(new Error("DB Error"));

      await addOrUpdateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // getCourseReviews
  // =========================

  describe("getCourseReviews", () => {
    test("should return reviews with average", async () => {
      Rating.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([{ rating: 5 }, { rating: 3 }]),
      });

      await getCourseReviews(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          averageRating: 4,
          totalReviews: 2,
        }),
      );
    });

    test("should return 500 on error", async () => {
      Rating.find.mockImplementation(() => {
        throw new Error("DB Error");
      });

      await getCourseReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // getMyRatings
  // =========================

  describe("getMyRatings", () => {
    test("should return user ratings", async () => {
      Rating.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ rating: 5, review: "Nice" }]),
      });

      await getMyRatings(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    test("should return 500 on error", async () => {
      Rating.find.mockImplementation(() => {
        throw new Error("DB Error");
      });

      await getMyRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
