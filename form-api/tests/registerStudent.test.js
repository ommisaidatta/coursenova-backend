const { registerStudent } = require("../controllers/studentController");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");

jest.mock("../models/student");
jest.mock("bcryptjs");

describe("registerStudent Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "123456",
        phone: "1234567890",
        address: "Test Address",
        gender: "Male",
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

  test("should return 400 if any field is missing", async () => {
    req.body = {};

    await registerStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "All fields are required",
    });
  });

  test("should return 409 if email already registered", async () => {
    Student.findOne.mockResolvedValue({ email: "john@example.com" });

    await registerStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email is already registered",
    });
  });

  test("should register student successfully", async () => {
    Student.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPassword");

    // mock save
    Student.mockImplementation(() => {
      return {
        save: jest.fn().mockResolvedValue({ _id: "123" }),
      };
    });

    await registerStudent(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Student registered successfully",
      id: "123",
    });
  });

  test("should return 500 on server error", async () => {
    Student.findOne.mockRejectedValue(new Error("DB Error"));

    await registerStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
