import request from "supertest";
import { app } from "../app";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
const bcrypt = require("bcryptjs");
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let refreshToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODYwNzE0ODAsImV4cCI6MTcxNzYwNzQ5MSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoidGVzdEBsb2dpbi5pdCIsInVzZXJuYW1lIjoidGVzdGxvZ2luIiwicm9sZSI6IlJlZ3VsYXIifQ.rVqGeKV8B-Uo_SIZ5lLfKDHCjBtOdyYQePXxqzcehpg";

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("register", () => {
  beforeAll(async () => {
    await User.create({
      username: "testsubject",
      email: "test@register.com",
      password: "password",
    });
  });
  test("nominal case for register", (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "username",
        email: "e@m.ail",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: { message: "User added successfully" },
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("exception, missng username", (done) => {
    request(app)
      .post("/api/register")
      .send({ email: "e@m.ail", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("exception, no email", (done) => {
    request(app)
      .post("/api/register")
      .send({ username: "username", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("exception, no password", (done) => {
    request(app)
      .post("/api/register")
      .send({ username: "username", email: "e@m.ail" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("exception, empty username", (done) => {
    request(app)
      .post("/api/register")
      .send({ username: "", email: "e@m.ail", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "all the attributes must not be empty strings",
        });
        done();
      })
      .catch((err) => done(err));
  });
  test("exception, empty email", (done) => {
    request(app)
      .post("/api/register")
      .send({ username: "username", email: "", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "all the attributes must not be empty strings",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("exception, empty password", (done) => {
    request(app)
      .post("/api/register")
      .send({ username: "", email: "e@m.ail", password: "" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "all the attributes must not be empty strings",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("execption, empty body", (done) => {
    request(app)
      .post("/api/register")
      .send({})
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("exception, invalid email format", (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "username",
        email: "em.ail",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "email must be a valid address format",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("exception, already used email", (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "testsubject1",
        email: "test@register.com",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "email already registered",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("execption, already used user", (done) => {
    request(app)
      .post("/api/register")
      .send({
        username: "testsubject",
        email: "test1@register.com",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "username already used",
        });
        done();
      })
      .catch((err) => done(err));
  });

  afterEach(async () => {
    await User.deleteMany({ email: { $ne: "test@register.com" } });
  });

  afterAll(async () => {
    await User.deleteMany();
  });
});

describe("registerAdmin", () => {
  beforeAll(async () => {
    await User.create({
      username: "Admin3",
      email: "Admin3@gmail.com",
      password: "password",
      role: "Admin",
    });
  });
  test("admin,nominal case", (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "username",
        email: "e@m.ail",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: { message: "Admin added successfully" },
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("admin, exception, no username", (done) => {
    request(app)
      .post("/api/admin")
      .send({ email: "e@m.ail", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("admin, exception, no email", (done) => {
    request(app)
      .post("/api/admin")
      .send({ username: "username", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("admin, exception, no password", (done) => {
    request(app)
      .post("/api/admin")
      .send({ username: "username", email: "e@m.ail" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("admin, exception, empty username", (done) => {
    request(app)
      .post("/api/admin")
      .send({ username: "", email: "e@m.ail", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "all the attributes must not be empty strings",
        });
        done();
      })
      .catch((err) => done(err));
  });
  test("admin, exception, empty email", (done) => {
    request(app)
      .post("/api/admin")
      .send({ username: "username", email: "", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "all the attributes must not be empty strings",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("admin, exception, empty password", (done) => {
    request(app)
      .post("/api/admin")
      .send({ username: "", email: "e@m.ail", password: "" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "all the attributes must not be empty strings",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("admin, exception, empty body", (done) => {
    request(app)
      .post("/api/admin")
      .send({})
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("admin, exception, invalid email format", (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "username",
        email: "em.ail",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "email must be a valid address format",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("admin, excetption, already used email", (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "username1",
        email: "Admin3@gmail.com",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "email already registered",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("admin, exception, already used user", (done) => {
    request(app)
      .post("/api/admin")
      .send({
        username: "Admin3",
        email: "test11@gmail.com",
        password: "password",
      })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "username already used",
        });
        done();
      })
      .catch((err) => done(err));
  });

  afterEach(async () => {
    await User.deleteMany({ email: { $ne: "Admin3@gmail.com" } });
  });

  afterAll(async () => {
    await User.deleteMany();
  });
});

describe("login", () => {
  beforeAll(async () => {
    let hashedPassword = await bcrypt.hash("password", 12);
    await User.create({
      username: "testlogin",
      email: "test@login.it",
      password: hashedPassword,
      refreshToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODYwNzE0ODAsImV4cCI6MTcxNzYwNzQ5MSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoidGVzdEBsb2dpbi5pdCIsInVzZXJuYW1lIjoidGVzdGxvZ2luIiwicm9sZSI6IlJlZ3VsYXIifQ.rVqGeKV8B-Uo_SIZ5lLfKDHCjBtOdyYQePXxqzcehpg",
    });
  });

  test("nominal case", (done) => {
    request(app)
      .post("/api/login")
      .send({ email: "test@login.it", password: "password" })
      .then((response) => {
        expect(response.status).toBe(200);

        done();
      })
      .catch((err) => done(err));
  });

  test("exception, missinig email", (done) => {
    request(app)
      .post("/api/login")
      .send({ password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });

        done();
      })
      .catch((err) => done(err));
  });

  test("exception, missinig password", (done) => {
    request(app)
      .post("/api/login")
      .send({ email: "test@login.it" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });

        done();
      })
      .catch((err) => done(err));
  });

  test("exception, empty email", (done) => {
    request(app)
      .post("/api/login")
      .send({ email: "", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "all the attributes must not be empty strings",
        });

        done();
      })
      .catch((err) => done(err));
  });

  test("exception, empty password", (done) => {
    request(app)
      .post("/api/login")
      .send({ email: "test@login.it", password: "" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "all the attributes must not be empty strings",
        });

        done();
      })
      .catch((err) => done(err));
  });

  test("exception, wrong email format", (done) => {
    request(app)
      .post("/api/login")
      .send({ email: "1.3", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "email must be a valid address format",
        });

        done();
      })
      .catch((err) => done(err));
  });

  test("exception, wrong email", (done) => {
    request(app)
      .post("/api/login")
      .send({ email: "testtt@login.com", password: "password" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "User not found. Please register",
        });

        done();
      })
      .catch((err) => done(err));
  });

  test("exception, wrong password", (done) => {
    request(app)
      .post("/api/login")
      .send({ email: "test@login.it", password: "passworddddd" })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Wrong password retry",
        });

        done();
      })
      .catch((err) => done(err));
  });

  test("exception, empty body", (done) => {
    request(app)
      .post("/api/login")
      .send({})
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "missing one or more neccessary attributes",
        });

        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await User.deleteMany();
  });
});

// TODO add these test
describe("logout", () => {
  beforeAll(async () => {
    let hashedPassword = await bcrypt.hash("password", 12);
    await User.create({
      username: "testlogin",
      email: "test@login.it",
      password: hashedPassword,
      refreshToken: refreshToken,
    });
  });

  test("nominal case", (done) => {
    request(app)
      .get("/api/logout")
      .set("Cookie", `accessToken=${refreshToken};refreshToken=${refreshToken}`)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: { message: "User logged out" },
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("exception case, no refresh token", (done) => {
    request(app)
      .get("/api/logout")
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Missing tokens in cookies cannot logout try logging in",
        });
        done();
      })
      .catch((err) => done(err));
  });

  test("exception case, no user with set token", (done) => {
    request(app)
      .get("/api/logout")
      .set(
        "Cookie",
        `accessToken=${refreshToken + "bb"};refreshToken=${refreshToken + "bb"}`
      )
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "User not found",
        });
        done();
      })
      .catch((err) => done(err));
  });

  afterAll(async () => {
    await User.deleteMany();
  });
});
