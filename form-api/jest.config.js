module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "utils/**/*.js",
  ],
};
