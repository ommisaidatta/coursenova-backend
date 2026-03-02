require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const enrollRoutes = require("./routes/enrollRoutes");
const profileRoutes = require("./routes/profileRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const progressRoutes = require("./routes/progressRoutes");
const reviewRoutes = require("./routes/ratingRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const courseRoutes = require("./routes/courseRoutes");

const app = express();

// Middlewares
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

// Create certificates folder if not exists
if (!fs.existsSync("certificates")) {
  fs.mkdirSync("certificates");
}

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/enroll", enrollRoutes);
app.use("/api", profileRoutes);
app.use("/api/lesson", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/rating", reviewRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/certificates", express.static("certificates"));

app.get("/", (req, res) => {
  res.send("Form API is running");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

module.exports = app;
