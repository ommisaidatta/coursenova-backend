const Certificate = require("../models/certificateModel");
const { v4: uuidv4 } = require("uuid");
const generateCertificatePDF = require("../utils/certificateGenerator");

const Student = require("../models/student");
const Course = require("../models/course");
const path = require("path");
const fs = require("fs");

// Generate Certificate
const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    const existing = await Certificate.findOne({
      studentId,
      courseId,
    });

    if (existing) {
      return res.json(existing);
    }

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return res.status(404).json({ message: "Data not found" });
    }

    const certificateId = uuidv4();

    const fileName = await generateCertificatePDF({
      studentName: `${student.firstname} ${student.lastname}`,
      courseName: course.title,
      certificateId,
      courseDuration: course.duration || "",
    });

    const certificate = await Certificate.create({
      studentId,
      courseId,
      certificateId,
      courseDuration: course.duration || "",
      certificateUrl: `certificates/${fileName}`,
    });

    res.status(201).json(certificate);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Certificate generation failed" });
  }
};

// Get Student Certificates (only return certificates whose PDF file exists)
const getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user.id;

    const certificates = await Certificate.find({ studentId })
      .populate("courseId", "title duration")
      .populate("studentId", "firstname lastname")
      .sort({ createdAt: -1 });

    const baseDir = path.join(__dirname, "..");
    const validCertificates = [];
    for (const cert of certificates) {
      const url = (cert.certificateUrl || "").replace(/^\//, "");
      const filePath = path.join(baseDir, url);
      if (fs.existsSync(filePath)) {
        validCertificates.push(cert);
      } else {
        await Certificate.findByIdAndDelete(cert._id).catch(() => {});
      }
    }

    res.json(validCertificates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const studentId = req.user.id;

    const certificate = await Certificate.findOne({
      certificateId,
      studentId,
    });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const url = (certificate.certificateUrl || "").replace(/^\//, "");
    const filePath = path.join(__dirname, "..", url);

    if (!fs.existsSync(filePath)) {
      await Certificate.findByIdAndDelete(certificate._id).catch(() => {});
      return res.status(404).json({ message: "Certificate file not found" });
    }

    res.download(filePath, path.basename(filePath));
  } catch (error) {
    // console.error("Certificate download error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate("studentId", "firstname lastname")
      .populate("courseId", "title");

    if (!certificate) {
      return res.status(404).json({ message: "Invalid Certificate" });
    }

    res.json({
      studentName:
        certificate.studentId.firstname + " " + certificate.studentId.lastname,
      courseName: certificate.courseId.title,
      issuedDate: certificate.createdAt,
      valid: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  generateCertificate,
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
};
