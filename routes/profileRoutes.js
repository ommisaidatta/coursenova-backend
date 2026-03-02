const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/profileController");

router.get("/profile", auth, getMyProfile);
router.put("/profile", auth, updateMyProfile);
router.put("/changepassword", auth, changePassword);

module.exports = router;
