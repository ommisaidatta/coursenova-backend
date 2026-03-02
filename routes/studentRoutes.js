const express = require("express");
const router = express.Router();

const {
  registerStudent,
  loginStudent,
  refreshAccessToken,
  logout,
} = require("../controllers/studentController");

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

module.exports = router;
