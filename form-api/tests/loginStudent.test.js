const { loginStudent } = require("../controllers/studentController");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../models/student");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("loginStudent Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "123456",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if email or password missing", async () => {
    req.body = {};

    await loginStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email and Password are required",
    });
  });

  test("should return 404 if student not found", async () => {
    Student.findOne.mockResolvedValue(null);

    await loginStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Student not found",
    });
  });

  test("should return 401 if password invalid", async () => {
    Student.findOne.mockResolvedValue({
      _id: "1",
      email: "test@example.com",
      password: "hashedpassword",
    });

    bcrypt.compare.mockResolvedValue(false);

    await loginStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid password",
    });
  });

  test("should login successfully and return token", async () => {
    Student.findOne.mockResolvedValue({
      _id: "1",
      email: "test@example.com",
      password: "hashedpassword",
      role: "student",
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fakeToken");

    await loginStudent(req, res);

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      accessToken: "fakeToken",
      role: "student",
    });
  });

  test("should return 500 on server error", async () => {
    Student.findOne.mockRejectedValue(new Error("DB Error"));

    await loginStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
