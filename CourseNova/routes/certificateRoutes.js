const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  generateCertificate,
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
} = require("../controllers/certificateController");

router.post("/generate", auth, generateCertificate);
router.get("/my-certificates", auth, getMyCertificates);
router.get("/download/:certificateId", auth, downloadCertificate);

router.get("/verify/:certificateId", verifyCertificate);

module.exports = router;
