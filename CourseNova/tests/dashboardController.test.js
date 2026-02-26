jest.mock("../models/enrollment");
jest.mock("../models/rating");

const Enrollment = require("../models/enrollment");
const Rating = require("../models/rating");

const { getDashboardStats } = require("../controllers/dashboardController");

describe("Dashboard Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
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

  test("should return dashboard stats successfully", async () => {
    Enrollment.countDocuments.mockResolvedValue(3);

    Rating.find.mockResolvedValue([{ rating: 4 }, { rating: 5 }]);

    await getDashboardStats(req, res);

    expect(res.json).toHaveBeenCalledWith({
      enrolledCourses: 3,
      averageRating: "4.5",
    });
  });

  test("should return zero rating if no ratings found", async () => {
    Enrollment.countDocuments.mockResolvedValue(2);
    Rating.find.mockResolvedValue([]);

    await getDashboardStats(req, res);

    expect(res.json).toHaveBeenCalledWith({
      enrolledCourses: 2,
      averageRating: "0.0",
    });
  });

  test("should return 500 on error", async () => {
    Enrollment.countDocuments.mockRejectedValue(new Error("DB error"));

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Stats fetch failed",
    });
  });
});
