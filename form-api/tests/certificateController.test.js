jest.mock("../utils/certificateGenerator", () =>
  jest.fn().mockResolvedValue("test-certificate.pdf"),
);
jest.mock("../models/certificateModel");
jest.mock("../models/student");
jest.mock("../models/course");
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid"),
}));
jest.mock("fs");

const {
  generateCertificate,
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
} = require("../controllers/certificateController");

const Certificate = require("../models/certificateModel");
const Student = require("../models/student");
const Course = require("../models/course");
const generateCertificatePDF = require("../utils/certificateGenerator");
const fs = require("fs");

describe("Certificate Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
      body: { courseId: "course123" },
      params: { certificateId: "mock-uuid" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      download: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // generateCertificate
  // =========================

  describe("generateCertificate", () => {
    test("should return existing certificate", async () => {
      Certificate.findOne.mockResolvedValue({ _id: "cert1" });

      await generateCertificate(req, res);

      expect(res.json).toHaveBeenCalledWith({ _id: "cert1" });
    });

    test("should return 404 if student or course not found", async () => {
      Certificate.findOne.mockResolvedValue(null);
      Student.findById.mockResolvedValue(null);

      await generateCertificate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should generate new certificate", async () => {
      Certificate.findOne.mockResolvedValue(null);

      Student.findById.mockResolvedValue({
        firstname: "Sai",
        lastname: "Datta",
      });

      Course.findById.mockResolvedValue({
        title: "Node Course",
        duration: "4 weeks",
      });

      generateCertificatePDF.mockResolvedValue("file.pdf");
      Certificate.create.mockResolvedValue({ _id: "newCert" });

      await generateCertificate(req, res);

      expect(generateCertificatePDF).toHaveBeenCalled();
      expect(Certificate.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should return 500 on error", async () => {
      Certificate.findOne.mockRejectedValue(new Error("DB Error"));

      await generateCertificate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // getMyCertificates
  // =========================

  describe("getMyCertificates", () => {
    test("should return only valid certificates", async () => {
      const mockCert = {
        _id: "cert1",
        certificateUrl: "certificates/file.pdf",
      };

      Certificate.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockCert]),
      });

      fs.existsSync.mockReturnValue(true);

      await getMyCertificates(req, res);

      expect(res.json).toHaveBeenCalledWith([mockCert]);
    });

    test("should delete certificate if file missing", async () => {
      const mockCert = {
        _id: "cert1",
        certificateUrl: "certificates/file.pdf",
      };

      Certificate.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockCert]),
      });

      fs.existsSync.mockReturnValue(false);
      Certificate.findByIdAndDelete.mockResolvedValue({});

      await getMyCertificates(req, res);

      expect(Certificate.findByIdAndDelete).toHaveBeenCalled();
    });
  });

  // =========================
  // downloadCertificate
  // =========================

  describe("downloadCertificate", () => {
    test("should return 404 if certificate not found", async () => {
      Certificate.findOne.mockResolvedValue(null);

      await downloadCertificate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 404 if file missing", async () => {
      Certificate.findOne.mockResolvedValue({
        _id: "cert1",
        certificateUrl: "certificates/file.pdf",
      });

      fs.existsSync.mockReturnValue(false);

      await downloadCertificate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(Certificate.findByIdAndDelete).toHaveBeenCalled();
    });

    test("should download file if exists", async () => {
      Certificate.findOne.mockResolvedValue({
        _id: "cert1",
        certificateUrl: "certificates/file.pdf",
      });

      fs.existsSync.mockReturnValue(true);

      await downloadCertificate(req, res);

      expect(res.download).toHaveBeenCalled();
    });
  });

  // =========================
  // verifyCertificate
  // =========================

  describe("verifyCertificate", () => {
    test("should return 404 if invalid", async () => {
      Certificate.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await verifyCertificate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return certificate details", async () => {
      Certificate.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            studentId: { firstname: "Sai", lastname: "Datta" },
            courseId: { title: "Node Course" },
            createdAt: new Date(),
          }),
        }),
      });

      await verifyCertificate(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: true,
        }),
      );
    });
  });
});
