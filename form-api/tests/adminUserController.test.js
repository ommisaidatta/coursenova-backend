jest.mock("../models/student");
jest.mock("../models/enrollment");
jest.mock("bcryptjs");

const Student = require("../models/student");
const Enrollment = require("../models/enrollment");
const bcrypt = require("bcryptjs");

const { createUser } = require("../controllers/admin.createUser");
const { deleteUser } = require("../controllers/admin.deleteUser");
const { changeUserRole } = require("../controllers/admin.changeUserRole");
const { getUserById } = require("../controllers/admin.getUser");
const { viewAllUsers } = require("../controllers/admin.viewUser");
const {
  getEnrollmentsByUserId,
} = require("../controllers/admin.enrolledBy.user");

describe("Admin User Controller", () => {
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
  // CREATE USER
  // =========================
  describe("createUser", () => {
    test("should return 400 if required fields missing", async () => {
      req.body = {};

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 409 if email already exists", async () => {
      req.body = {
        firstname: "Sai",
        lastname: "K",
        email: "test@mail.com",
        password: "123456",
      };

      Student.findOne.mockResolvedValue({});

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    test("should create user successfully", async () => {
      req.body = {
        firstname: "Sai",
        lastname: "K",
        email: "test@mail.com",
        password: "123456",
        role: "admin",
      };

      Student.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");

      Student.create.mockResolvedValue({
        toObject: () => ({
          firstname: "Sai",
          lastname: "K",
          email: "test@mail.com",
          role: "admin",
        }),
      });

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // =========================
  // DELETE USER
  // =========================
  describe("deleteUser", () => {
    test("should delete user successfully", async () => {
      req.params.id = "user123";

      Student.findByIdAndDelete.mockResolvedValue({});

      await deleteUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    test("should return 404 if user not found", async () => {
      req.params.id = "user123";

      Student.findByIdAndDelete.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // =========================
  // CHANGE ROLE
  // =========================
  describe("changeUserRole", () => {
    test("should return 400 for invalid role", async () => {
      req.body.role = "invalid";

      await changeUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 404 if user not found", async () => {
      req.body.role = "admin";
      req.params.id = "user123";

      Student.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await changeUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // =========================
  // GET USER BY ID
  // =========================
  describe("getUserById", () => {
    test("should return user", async () => {
      req.params.id = "user123";

      Student.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ firstname: "Sai" }),
      });

      await getUserById(req, res);

      expect(res.json).toHaveBeenCalled();
    });

    test("should return 404 if not found", async () => {
      req.params.id = "user123";

      Student.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // =========================
  // VIEW ALL USERS
  // =========================
  describe("viewAllUsers", () => {
    test("should return all users", async () => {
      Student.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([{ firstname: "Sai" }]),
        }),
      });

      await viewAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // =========================
  // GET ENROLLMENTS BY USER
  // =========================
  describe("getEnrollmentsByUserId", () => {
    test("should return enrollments", async () => {
      req.params.userId = "user123";

      Enrollment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([{ course: "c1" }]),
      });

      await getEnrollmentsByUserId(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });
});
