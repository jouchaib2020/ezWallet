import request from "supertest";
import { app } from "../app";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { register, registerAdmin, login, logout } from "../controllers/auth";

const userTokens = {
  accessToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFAYi5jIiwiaWQiOiI2NDc0YzRiNjM1Y2FjZGE4Njg2NjdjNjIiLCJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiUmVndWxhciIsImlhdCI6MTY4NTYzMDM1OCwiZXhwIjoxNjg1NjMzOTU4fQ.T7rv_DivnwmSdjI4xfzTZreZ2GuoeEH2UHjEVqyoxH4",
  refreshToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFAYi5jIiwiaWQiOiI2NDc0YzRiNjM1Y2FjZGE4Njg2NjdjNjIiLCJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiUmVndWxhciIsImlhdCI6MTY4NTYzMDM1OCwiZXhwIjoxNjg2MjM1MTU4fQ.sND49QtuNsLleugNU8BnIkmL5Hl_9kYz0TVC0OFtJq4",
};

const adminTokens = {
  accessToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjRANS42IiwiaWQiOiI2NDZkMjQ1OWM4YTliNjQ3Mzc4YjhkYjciLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNjg1NjMwNDY3LCJleHAiOjE2ODU2MzQwNjd9.qwsTXR3CeJsL29ZeOjjPEtzEtirVxCmbvhKTZwafP70",
  refreshToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjRANS42IiwiaWQiOiI2NDZkMjQ1OWM4YTliNjQ3Mzc4YjhkYjciLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNjg1NjMwNDY3LCJleHAiOjE2ODYyMzUyNjd9.Z7FDDr2PWRRJN1WDIm4ORbKMLnyvrhtpPaWDg3X1nhM",
};

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../models/User.js");

beforeEach(() => {
  User.findOne.mockClear();
  User.create.mockClear();
});

describe("register", () => {
  test("nominal case", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "neverused",
        email: "a@d.m",
        password: "password",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "expired token",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(User, "findOne").mockImplementation(() => false);

    jest.spyOn(User, "create").mockImplementation(() => {});

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        message: "User added successfully",
      },
    });
  });

  test("exception, 500  error", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "test",
        email: "1@2.3",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    User.findOne.mockImplementation(() => {
      throw new Error("error");
    });

    await register(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test("exception, missing password", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "neverused",
        email: "a@d.m",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("exception, missing email", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "neverused",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("exception, missing username", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        email: "a@d.m",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("exception, empty username", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "",
        email: "a@d.m",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "all the attributes must not be empty strings",
    });
  });

  test("exception, empty email", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "neverused",
        email: "",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "all the attributes must not be empty strings",
    });
  });

  test("exception, empty passowrd", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "neverused",
        email: "a@d.m",
        password: "",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "all the attributes must not be empty strings",
    });
  });

  test("exception, empty body", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {},
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("exception, already used email", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "neverused",
        email: "1@2.3",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    jest.spyOn(User, "findOne").mockImplementation(() => true);
    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "email already registered",
    });
  });

  test("exception, already used username", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "neverused",
        email: "a@d.m",
        password: "password",
      },
    };

    const mockRes = {
      locals: {
        refreshedTokenMessage: "expired token",
      },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(User, "findOne")
      .mockImplementation(() => true)
      .mockReturnValueOnce(false);

    jest.spyOn(User, "create").mockImplementation(() => {});

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "username already used",
    });
  });
  test("exception, wrong email format ", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "admin",
        email: "1.3",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await register(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "email must be a valid address format",
    });
  });
});

describe("registerAdmin", () => {
  test("nominal case", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "admin",
        email: "a@d.m",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    jest.spyOn(User, "findOne").mockImplementation(() => false);
    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        message: "Admin added successfully",
      },
    });
  });

  test("admin, exception, 500  error", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "test",
        email: "1@2.3",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    User.findOne.mockImplementation(() => {
      throw new Error("error");
    });

    await registerAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test("admin, exception, missing password", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "admin",
        email: "a@d.m",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("admin, exception, missing email", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "admin",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("admin, exception, missign username", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        email: "a@d.m",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("admin, exception, empty username", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "",
        email: "a@d.m",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "all the attributes must not be empty strings",
    });
  });

  test("admin, exception, empty email", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "admin",
        email: "",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "all the attributes must not be empty strings",
    });
  });

  test("admin, exception, empty passowrd", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "admin",
        email: "a@d.m",
        password: "",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "all the attributes must not be empty strings",
    });
  });

  test("admin, exception, empty Body", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {},
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("admin, exception, already used email", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "admin",
        email: "1@2.3",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    jest.spyOn(User, "findOne").mockImplementation(() => true);
    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "email already registered",
    });
  });

  test("admin, exception, already used username", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "admin",
        email: "1@2.3",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    jest
      .spyOn(User, "findOne")
      .mockImplementation(() => true)
      .mockReturnValueOnce(false);
    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "username already used",
    });
  });

  test("admin, exception, wrong email format ", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "admin",
        email: "1.3",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "email must be a valid address format",
    });
  });
});

describe("login", () => {
  test("nominal case", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        email: "1@2.3",
        password: "admin",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
      cookie: jest.fn(),
    };

    jest
      .spyOn(User, "findOne")
      .mockImplementation(() => ({ password: "test", save: jest.fn() }));

    jest.spyOn(bcrypt, "compare").mockImplementation(() => {
      return Promise.resolve(true);
    });

    jest.spyOn(jwt, "sign").mockImplementation(() => {
      return Promise.resolve(true);
    });

    await login(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("exception, 500 error", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        username: "test",
        email: "1@2.3",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
    };

    User.findOne.mockImplementation(() => {
      throw new Error("error");
    });

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test("exception, missing email", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        password: "admin",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
      cookie: jest.fn(),
    };

    await login(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("exception, missing password", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        email: "1@2.3",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
      cookie: jest.fn(),
    };

    await login(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("exception, empty password", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        email: "1@2.3",
        password: "",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
      cookie: jest.fn(),
    };

    await login(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "all the attributes must not be empty strings",
    });
  });

  test("exception, empty email", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        email: "",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
      cookie: jest.fn(),
    };

    await login(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "all the attributes must not be empty strings",
    });
  });

  test("exception, empty body", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {},
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
      cookie: jest.fn(),
    };

    await login(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "missing one or more neccessary attributes",
    });
  });

  test("exception, not valid email", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        email: "12.3",
        password: "password",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
      cookie: jest.fn(),
    };

    await login(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "email must be a valid address format",
    });
  });

  test("exception, wrong password", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        email: "1@2.3",
        password: "admin",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
      cookie: jest.fn(),
    };

    jest.spyOn(User, "findOne").mockImplementation(() => true);
    jest.spyOn(bcrypt, "compare").mockImplementation(() => {
      return Promise.resolve(false);
    });

    await login(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Wrong password retry",
    });
  });

  test("exception, wrong user", async () => {
    const mockReq = {
      params: {},
      cookies: {},
      body: {
        email: "1@2.3",
        password: "admin",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token",
      },
      cookie: jest.fn(),
    };

    jest.spyOn(User, "findOne").mockImplementation(() => false);

    await login(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User not found. Please register",
    });
  });
});

describe("logout", () => {
  test("Nominal scenario", async () => {
    const req = {
      cookies: {
        refreshToken: "mockedRefreshToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    const mockUser = {
      refreshToken: "mockRefreshToken",
      save: jest.fn().mockResolvedValue({}),
    };

    jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        message: "User logged out",
      },
    });
    expect(res.cookie).toHaveBeenCalledWith("accessToken", "", {
      httpOnly: true,
      path: "/api",
      maxAge: 0,
      sameSite: "none",
      secure: true,
    });
    expect(res.cookie).toHaveBeenCalledWith("refreshToken", "", {
      httpOnly: true,
      path: "/api",
      maxAge: 0,
      sameSite: "none",
      secure: true,
    });
    expect(mockUser.refreshToken).toBeNull();
  });

  test("should return an error if refreshToken is missing in cookies", async () => {
    const req = {
      cookies: {
        refreshToken: undefined,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing tokens in cookies cannot logout try logging in",
    });
  });

  test("should return an error if user is not found", async () => {
    const req = {
      cookies: {
        refreshToken: "mockedRefreshToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    jest.spyOn(User, "findOne").mockResolvedValue(null);

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    expect(User.findOne).toHaveBeenCalledWith({
      refreshToken: "mockedRefreshToken",
    });
  });

  test("should return a server error if an exception occurs", async () => {
    const req = {
      cookies: {
        refreshToken: "mockedRefreshToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
