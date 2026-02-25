jest.mock("../models/student");
jest.mock("../models/course");
jest.mock("../models/enrollment");
jest.mock("../models/certificateModel");

const Student = require("../models/student");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const Certificate = require("../models/certificateModel");

const { dashboardSummary } = require("../controllers/admin.dashboard");

describe("Dashboard Summary Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return dashboard summary successfully", async () => {
    Student.countDocuments.mockResolvedValue(10);
    Course.countDocuments.mockResolvedValue(5);
    Enrollment.countDocuments.mockResolvedValue(20);
    Certificate.countDocuments.mockResolvedValue(7);

    await dashboardSummary(req, res);

    expect(res.json).toHaveBeenCalledWith({
      totalUsers: 10,
      totalCourses: 5,
      totalEnrollments: 20,
      totalCertificates: 7,
    });
  });

  test("should return 500 on server error", async () => {
    Student.countDocuments.mockRejectedValue(new Error());

    await dashboardSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
    });
  });
});
