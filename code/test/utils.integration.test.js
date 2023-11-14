import {
    handleDateFilterParams,
    verifyAuth,
    handleAmountFilterParams,
    findExistingMembers,
} from "../controllers/utils";
import jwt from "jsonwebtoken";
import { User, Group } from "../models/User.js";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const adminAccessTokenValid = jwt.sign(
    {
        email: "admin@email.com",
        //id: existingUser.id, The id field is not required in any check, so it can be omitted
        username: "admin",
        role: "Admin",
    },
    process.env.ACCESS_KEY,
    { expiresIn: "1y" }
);
const testerAccessTokenValid = jwt.sign(
    {
        email: "tester@test.com",
        username: "tester",
        role: "Regular",
    },
    process.env.ACCESS_KEY,
    { expiresIn: "1y" }
);
const testerAccessTokenIncomplete = jwt.sign(
    {
        email: "tester@test.com",
        username: null,
        role: "Regular",
    },
    process.env.ACCESS_KEY,
    { expiresIn: "1y" }
);
//These tokens can be used in order to test the specific authentication error scenarios inside verifyAuth (no need to have multiple authentication error tests for the same route)
const testerAccessTokenExpired = jwt.sign(
    {
        email: "tester@test.com",
        username: "tester",
        role: "Regular",
    },
    process.env.ACCESS_KEY,
    { expiresIn: "0s" }
);

const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, {
    expiresIn: "1y",
});
beforeAll(async () => {
    const dbName = "testingDatabaseController";
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

describe("handleDateFilterParams", () => {
    test("Nominal only date", () => {
        const req = {
            query: {
                date: "2023-04-30",
            },
        };

        const result = handleDateFilterParams(req);

        expect(result).toEqual({
            date: {
                $gte: new Date("2023-04-30T00:00:00.000Z"),
                $lte: new Date("2023-04-30T23:59:59.999Z"),
            },
        });
    });
    test("returns correct filter object when from and upTo are provided", () => {
        const req = {
            query: {
                from: "2023-04-30",
                upTo: "2023-05-31",
            },
        };

        const result = handleDateFilterParams(req);

        expect(result).toEqual({
            date: {
                $gte: new Date("2023-04-30T00:00:00.000Z"),
                $lte: new Date("2023-05-31T23:59:59.999Z"),
            },
        });
    });
    test("returns an error when date is provided with from or upTo", () => {
        const req = {
            query: {
                date: "2023-04-30",
                from: "2023-04-01",
            },
        };

        expect(() => {
            handleDateFilterParams(req);
        }).toThrow("Can't use date filter together with from or upTo");
    });
    test("returns empty filter when date, from or upTo are not provided", () => {
        const req = {
            query: {},
        };

        const result = handleDateFilterParams(req);

        expect(result).toEqual({});
    });
    test("returns a error if date is written wrong", () => {
        const req = {
            query: { date: "20-2023-30" },
        };

        expect(() => {
            handleDateFilterParams(req);
        }).toThrow("Invalid date format: Expected format: YYYY-MM-DD");
    });
    test("returns a error if upTo is written wrong", () => {
        const req = {
            query: { upTo: "20-2023-30" },
        };

        expect(() => {
            handleDateFilterParams(req);
        }).toThrow("Invalid date format: Expected format: YYYY-MM-DD");
    });
    test("returns a error if from is written wrong", () => {
        const req = {
            query: { from: "20-2023-30" },
        };

        expect(() => {
            handleDateFilterParams(req);
        }).toThrow("Invalid date format: Expected format: YYYY-MM-DD");
    });
});

describe("verifyAuth", () => {
    test("verifyAuth should return true for valid user authentication", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenValid,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "User",
            username: "tester",
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });
    });
    test("verifyAuth should return true for valid Admin authentication", () => {
        const Req = {
            cookies: {
                accessToken: adminAccessTokenValid,
                refreshToken: adminAccessTokenValid,
            },
        };
        const Res = {
            locals: {},
        };

        const Info = {
            authType: "Admin",
            username: "admin",
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });
    });
    test("verifyAuth should return true for valid Group authentication", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenValid,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "Group",
            username: "tester",
            emails: ["tester@test.com", "valid-email2"],
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });
    });
    test("verifyAuth should return false and error for token missing information on refreshToken", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenValid,
                refreshToken: testerAccessTokenIncomplete,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email", "valid-email2"],
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "Token is missing information",
        });
    });
    test("verifyAuth should return false and error for token missing information on accessToken", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenIncomplete,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email", "valid-email2"],
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "Token is missing information",
        });
    });
    test("verifyAuth should return false and error for tokens not matching", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenValid,
                refreshToken: adminAccessTokenValid,
            },
        };
        const Res = {
            refreshedTokenMessag: "",
        };

        const Info = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email", "valid-email2"],
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "Mismatched users",
        });
    });
    test("verifyAuth does not have a accesstoken and should return unathorized", () => {
        const Req = {
            cookies: {
                accessToken: "",
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "User",
            username: "requested-username",
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({ authorized: false, cause: "Unauthorized" });
    });
    test("verifyAuth should return false for invalid user authentication", () => {
        const Req = {
            cookies: {
                accessToken: adminAccessTokenValid,
                refreshToken: adminAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "User",
            username: "valid-username",
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "Username in url params doesn't match the token",
        });
    });
    test("verifyAuth should return false for invalid Admin authentication", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenValid,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "Admin",
            username: "valid-username",
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "Logged user is not admin",
        });
    });
    test("verifyAuth should return false for invalid Group authentication", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenValid,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email0", "valid-email2"],
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "User is not a part of the group",
        });
    });
    test("verifyAuth should return false if the User refresh token is not equal to the accestoken", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenExpired,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "User",
            username: "valid-username",
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "Username doesn't match the token",
        });
    });
    test("verifyAuth should return false if the refesh toke role of a admin is a regular user", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenExpired,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "Admin",
            username: "valid-username",
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "Logged user is not admin",
        });
    });
    test("verifyAuth should return false if User is not part of a group", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenExpired,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email0", "valid-email2"],
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "User is not a part of the group",
        });
    });
    test("verifyAuth should create a new refreshToken if the other is expired", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenExpired,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessage: "",
            },
            cookie: jest.fn(),
        };

        const Info = {
            authType: "Group",
            username: "test",
            emails: ["tester@test.com"],
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });
    });
    test('verifyAuth should return a general error after the "Token is expired error" is raised', () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenExpired,
                refreshToken: testerAccessTokenValid,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "Simple",
            username: "valid-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({ authorized: false, cause: "TypeError" });
    });
    test("verifyAuth should return false and ask to login again if the tokens are expire", () => {
        const Req = {
            cookies: {
                accessToken: testerAccessTokenExpired,
                refreshToken: testerAccessTokenExpired,
            },
        };
        const Res = {
            locals: {
                refreshedTokenMessag: "",
            },
        };

        const Info = {
            authType: "User",
            username: "valid-username",
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "Perform login again",
        });
    });
    test("verifyAuth should return false if a general error occurs", () => {
        const Req = {
            cookies: {
                accessToken: "x",
                refreshToken: "x",
            },
        };
        const Res = {};

        const Info = {
            authType: "User",
            username: "tester",
        };

        const result = verifyAuth(Req, Res, Info);

        expect(result).toEqual({
            authorized: false,
            cause: "JsonWebTokenError",
        });
    });
});

describe("handleAmountFilterParams", () => {
    test("returns empty filter object when no req are provided", () => {
        const req = {
            query: {},
        };

        const result = handleAmountFilterParams(req);

        expect(result).toEqual({});
    });
    test("returns error for not entering numerical input", () => {
        const req = {
            query: { min: "hello" },
        };

        expect(() => {
            handleAmountFilterParams(req);
        }).toThrow("Invalid numerical value: Expected a numerical input.");
    });

    test("returns correct filter object when min and max are provided", () => {
        const req = {
            query: {
                min: "50",
                max: "200",
            },
        };

        const result = handleAmountFilterParams(req);

        expect(result).toEqual({ amount: { $gte: 50, $lte: 200 } });
    });
});

describe("findExistingMembers", () => {
    beforeEach(async () => {
        const user = await User.create({
            username: "testuser1",
            email: "testuser1@example.com",
            password: "testpassword",
            refreshToken: testerAccessTokenValid,
            role: "Regular",
        });
        const admin = await User.create({
            username: "admin",
            email: "admin@example.com",
            password: "adminpassword",
            refreshToken: adminAccessTokenValid,
            role: "Admin",
        });
        await Group.create({
            name: "testGroup",
            members: [{ email: user.email, user: user.id }],
        });
    });

    afterEach(async () => {
        await User.deleteMany();
        await Group.deleteMany();
    });
    test("should return the correct result object", async () => {
        const memberEmails = [
            "testuser1@example.com",
            "testuser2@example.com",
            "admin@example.com",
        ];

        const result = await findExistingMembers(memberEmails);

        expect(result).toEqual({
            existingMembers: ["testuser1@example.com", "admin@example.com"],
            alreadyInGroupMembers: ["testuser1@example.com"],
            notFoundMembers: ["testuser2@example.com"],
        });
    });
});
