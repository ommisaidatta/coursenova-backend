jest.mock("../models/course");

const Course = require("../models/course");

const { getAllCourses } = require("../controllers/admin.allCourses");
const { createCourse } = require("../controllers/admin.createCourse");
const { deleteCourse } = require("../controllers/admin.deleteCourse");
const { updateCourse } = require("../controllers/admin.updateCourse");

describe("Admin Course Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: "admin123" },
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
  // GET ALL COURSES
  // =========================
  describe("getAllCourses", () => {
    test("should return all courses", async () => {
      Course.find.mockResolvedValue([{ title: "Node" }]);

      await getAllCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        totalCourses: 1,
        courses: [{ title: "Node" }],
      });
    });

    test("should return 500 on error", async () => {
      Course.find.mockRejectedValue(new Error());

      await getAllCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // CREATE COURSE
  // =========================
  describe("createCourse", () => {
    test("should return 400 if required fields missing", async () => {
      req.body = {};

      await createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 409 if course already exists", async () => {
      req.body = {
        title: "Node",
        duration: "2h",
      };

      Course.findOne.mockResolvedValue({});

      await createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    test("should create course successfully", async () => {
      req.body = {
        title: "Node",
        duration: "2h",
      };

      Course.findOne.mockResolvedValue(null);
      Course.create.mockResolvedValue({ title: "Node" });

      await createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // =========================
  // DELETE COURSE
  // =========================
  describe("deleteCourse", () => {
    test("should return 404 if course not found", async () => {
      req.params.id = "course123";

      Course.findById.mockResolvedValue(null);

      await deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should delete course successfully", async () => {
      req.params.id = "course123";

      Course.findById.mockResolvedValue({ _id: "course123" });
      Course.findByIdAndDelete.mockResolvedValue({});

      await deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // =========================
  // UPDATE COURSE
  // =========================
  describe("updateCourse", () => {
    test("should return 404 if course not found", async () => {
      req.params.id = "course123";

      Course.findById.mockResolvedValue(null);

      await updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should update course successfully", async () => {
      req.params.id = "course123";
      req.body = { title: "Updated" };

      const mockSave = jest.fn().mockResolvedValue({
        title: "Updated",
      });

      Course.findById.mockResolvedValue({
        title: "Old",
        save: mockSave,
      });

      await updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
