jest.mock("../models/student");
jest.mock("../models/enrollment");
jest.mock("bcryptjs");

const User = require("../models/student");
const Enrollment = require("../models/enrollment");
const bcrypt = require("bcryptjs");

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/profileController");

describe("Profile Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
      body: {
        firstname: "Sai",
        lastname: "Datta",
        email: "sai@test.com",
        phone: "9999999999",
        gender: "Male",
        address: "India",
        currentPassword: "oldpass",
        newPassword: "newpass",
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

  // =========================
  // getMyProfile
  // =========================

  describe("getMyProfile", () => {
    test("should return profile data", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          firstname: "Sai",
          lastname: "Datta",
          email: "sai@test.com",
          phone: "999",
          gender: "Male",
          address: "India",
        }),
      });

      Enrollment.find.mockResolvedValue([{}, {}]);

      await getMyProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalEnrollments: 2,
        }),
      );
    });

    test("should return 404 if user not found", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await getMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 500 on error", async () => {
      User.findById.mockImplementation(() => {
        throw new Error("DB error");
      });

      await getMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // updateMyProfile
  // =========================

  describe("updateMyProfile", () => {
    test("should update profile successfully", async () => {
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "user123",
          firstname: "Sai",
          lastname: "Datta",
          email: "sai@test.com",
          phone: "999",
          gender: "Male",
          address: "India",
        }),
      });

      Enrollment.countDocuments.mockResolvedValue(3);

      await updateMyProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalEnrollments: 3,
        }),
      );
    });

    test("should return 404 if user not found", async () => {
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await updateMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 500 on error", async () => {
      User.findByIdAndUpdate.mockImplementation(() => {
        throw new Error("DB error");
      });

      await updateMyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // changePassword
  // =========================

  describe("changePassword", () => {
    test("should change password successfully", async () => {
      const mockSave = jest.fn();

      User.findById.mockResolvedValue({
        password: "hashedOld",
        save: mockSave,
      });

      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashedNew");

      await changePassword(req, res);

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Password changed successfully",
      });
    });

    test("should return 404 if user not found", async () => {
      User.findById.mockResolvedValue(null);

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 400 if password incorrect", async () => {
      User.findById.mockResolvedValue({
        password: "hashedOld",
      });

      bcrypt.compare.mockResolvedValue(false);

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 500 on error", async () => {
      User.findById.mockRejectedValue(new Error("DB error"));

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
