const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

jest.mock("jsonwebtoken");

describe("authMiddleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test("should return 401 if no token provided", () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if token is invalid", () => {
    req.headers.authorization = "Bearer invalidtoken";

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next and attach user if token is valid", () => {
    req.headers.authorization = "Bearer validtoken";

    const decodedUser = { id: "123", role: "admin" };

    jwt.verify.mockReturnValue(decodedUser);

    authMiddleware(req, res, next);

    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
  });
});
