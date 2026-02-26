module.exports = {
  testEnvironment: "node",

  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  coverageDirectory: "coverage",

  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "utils/**/*.js",
  ],
};
