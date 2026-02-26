const request = require("supertest");
const app = require("../app");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");

describe("Student Auth Integration", () => {
  it("should register student", async () => {
    const res = await request(app)
      .post("/api/students/register") // ✅ correct
      .send({
        firstname: "Test",
        lastname: "User",
        email: "testing@test.com",
        password: "123456",
        phone: "1234567890",
        address: "Test Address",
        gender: "male",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("testing@test.com");
  });

  it("should login student", async () => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await Student.create({
      firstname: "Login",
      lastname: "User",
      email: "login@test.com",
      password: hashedPassword,
      phone: "1234567890",
      address: "Test Address",
      gender: "male",
    });

    const res = await request(app).post("/api/students/login").send({
      email: "login@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });
});
