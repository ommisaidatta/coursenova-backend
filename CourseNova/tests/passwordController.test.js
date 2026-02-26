jest.mock("../models/student");
jest.mock("bcryptjs");
jest.mock("../utils/sendEmail");

const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const {
  forgotPassword,
  resetPassword,
} = require("../controllers/passwordController");

describe("Password Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "sai@test.com",
        password: "newPassword123",
      },
      params: {
        token: "plainToken",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    process.env.FRONTEND_URL = "http://localhost:3000";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // forgotPassword
  // =========================

  describe("forgotPassword", () => {
    test("should return 404 if email not found", async () => {
      Student.findOne.mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should generate token and send email", async () => {
      const mockSave = jest.fn();

      Student.findOne.mockResolvedValue({
        email: "sai@test.com",
        save: mockSave,
      });

      jest.spyOn(crypto, "randomBytes").mockReturnValue({
        toString: () => "rawToken",
      });

      jest.spyOn(crypto, "createHash").mockReturnValue({
        update: () => ({
          digest: () => "hashedToken",
        }),
      });

      await forgotPassword(req, res);

      expect(mockSave).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Reset link sent to email",
      });
    });
  });

  // =========================
  // resetPassword
  // =========================

  describe("resetPassword", () => {
    test("should return 400 if token invalid", async () => {
      jest.spyOn(crypto, "createHash").mockReturnValue({
        update: () => ({
          digest: () => "hashedToken",
        }),
      });

      Student.findOne.mockResolvedValue(null);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should reset password successfully", async () => {
      const mockSave = jest.fn();

      jest.spyOn(crypto, "createHash").mockReturnValue({
        update: () => ({
          digest: () => "hashedToken",
        }),
      });

      Student.findOne.mockResolvedValue({
        save: mockSave,
      });

      bcrypt.hash.mockResolvedValue("hashedPassword");

      await resetPassword(req, res);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Password reset successful",
      });
    });
  });
});
