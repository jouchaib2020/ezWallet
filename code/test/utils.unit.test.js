import {
    handleDateFilterParams,
    verifyAuth,
    handleAmountFilterParams,
    findExistingMembers,
} from "../controllers/utils";
import jwt from "jsonwebtoken";
import { User, Group } from "../models/User.js";

jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    verify: jest.fn().mockReturnValue({ foo: "bar" }),
}));

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
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "User",
            username: "valid-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValue({
            username: "valid-username",
            email: "valid-email",
            role: "Regular",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return true for valid Admin authentication", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "Admin",
            username: "valid-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValue({
            username: "valid-username",
            email: "valid-email",
            role: "Admin",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return true for valid Group authentication", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email", "valid-email2"],
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValue({
            username: "valid-username",
            email: "valid-email",
            role: "Regular",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return false and error for token missing information on refreshToken", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email", "valid-email2"],
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValueOnce({
            username: "valid-username",
            email: "valid-email",
            role: "Regular",
        });

        const mockJwtVerify2 = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValueOnce({
            username: "valid-username",
            email: "valid-email",
            role: "",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({
            authorized: false,
            cause: "Token is missing information",
        });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return false and error for token missing information on accessToken", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email", "valid-email2"],
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValueOnce({
            username: "valid-username",
            email: "valid-email",
            role: "",
        });

        const mockJwtVerify2 = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValueOnce({
            username: "valid-username>",
            email: "valid-email",
            role: "Regular",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({
            authorized: false,
            cause: "Token is missing information",
        });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return false and error for tokens not matching", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockInfo = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email", "valid-email2"],
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValueOnce({
            username: "valid-username",
            email: "valid-email",
            role: "Admin",
        });

        mockJwtVerify.mockReturnValueOnce({
            username: "valid-username1",
            email: "valid-email",
            role: "Regular",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({
            authorized: false,
            cause: "Mismatched users",
        });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth does not have a accesstoken and should return unathorized", () => {
        const mockReq = {
            cookies: {
                accessToken: null,
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "User",
            username: "requested-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValueOnce({
            username: "valid-username",
            email: "valid-email",
            role: "Regular",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({ authorized: false, cause: "Unauthorized" });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return false for invalid user authentication", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "User",
            username: "valid-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValue({
            username: "valid-username",
            email: "valid-email",
            role: "Admin",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({
            authorized: false,
            cause: "Username in url params doesn't match the token",
        });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return false for invalid Admin authentication", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "Admin",
            username: "valid-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValue({
            username: "valid-username",
            email: "valid-email",
            role: "Regular",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({
            authorized: false,
            cause: "Logged user is not admin",
        });
        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return false for invalid Group authentication", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email0", "valid-email2"],
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockReturnValue({
            username: "valid-username",
            email: "valid-email",
            role: "Regular",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({
            authorized: false,
            cause: "User is not a part of the group",
        });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return false if the refesh toke role of a admin is a regular user", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "expired-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "Admin",
            username: "valid-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockImplementationOnce(() => {
            throw new jwt.TokenExpiredError("Token expired");
        });
        mockJwtVerify.mockReturnValueOnce({
            username: "valid-username",
            email: "valid-email",
            role: "Regular",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({
            authorized: false,
            cause: "Logged user is not admin",
        });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return false if User is not part of a group", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "expired-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email0", "valid-email2"],
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockImplementationOnce(() => {
            throw new jwt.TokenExpiredError("Token expired");
        });
        mockJwtVerify.mockReturnValueOnce({
            username: "valid-username",
            email: "valid-email",
            role: "Regular",
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({
            authorized: false,
            cause: "User is not a part of the group",
        });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should create a new refreshToken if the other is expired", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "expired-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
            cookie: jest.fn(),
        };

        const mockInfo = {
            authType: "Group",
            username: "valid-username",
            emails: ["valid-email"],
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");

        mockJwtVerify.mockImplementationOnce(() => {
            throw new jwt.TokenExpiredError("Token expired");
        });

        mockJwtVerify.mockImplementationOnce(() => {
            return {
                username: "valid-username",
                email: "valid-email",
                role: "Regular",
            };
        });

        const mockJwtSign = jest.spyOn(jwt, "sign");
        mockJwtSign.mockReturnValue(
            {
                username: "valid-username",
                email: "valid-email",
                id: "valid-id",
                role: "Regular",
            },
            "EzWallet",
            { expiresIn: "1h" }
        );

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({ authorized: true, cause: "Authorized" });

        mockJwtVerify.mockRestore();
        mockJwtSign.mockRestore();
    });
    test('verifyAuth should return a general error after the "Token is expired error" is raised', () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "expired-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "Simple",
            username: "valid-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");

        mockJwtVerify.mockImplementationOnce(() => {
            throw new jwt.TokenExpiredError("Token expired");
        });

        mockJwtVerify.mockImplementationOnce(() => {
            return {
                username: "valid-username",
                email: "valid-email",
                role: "Regular",
            };
        });

        const mockJwtSign = jest.spyOn(jwt, "sign");
        mockJwtSign.mockReturnValue(
            {
                username: "valid-username",
                email: "valid-email",
                id: "valid-id",
                role: "Regular",
            },
            "EzWallet",
            { expiresIn: "1h" }
        );

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({ authorized: false, cause: "TypeError" });

        mockJwtVerify.mockRestore();
        mockJwtSign.mockRestore();
    });
    test("verifyAuth should return false and ask to login again if the tokens are expire", () => {
        const mockReq = {
            cookies: {
                accessToken: "expired-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "User",
            username: "valid-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockImplementation(() => {
            throw new jwt.TokenExpiredError("Token expired");
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({
            authorized: false,
            cause: "Perform login again",
        });

        mockJwtVerify.mockRestore();
    });
    test("verifyAuth should return false if a general error occurs", () => {
        const mockReq = {
            cookies: {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
            },
        };
        const mockRes = {
            locals: {
                refreshedTokenMessag: jest.fn(),
            },
        };

        const mockInfo = {
            authType: "User",
            username: "valid-username",
        };

        const mockJwtVerify = jest.spyOn(jwt, "verify");
        mockJwtVerify.mockImplementation(() => {
            throw new Error("Error");
        });

        const result = verifyAuth(mockReq, mockRes, mockInfo);

        expect(result).toEqual({ authorized: false, cause: "Error" });

        mockJwtVerify.mockRestore();
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
        }).toThrow("nvalid numerical value: Expected a numerical input.");
    });

    test("returns correct filter object when min and max are provided", () => {
        const req = {
            query: {
                min: "50",
                max: "200",
            },
        };

        const result = handleAmountFilterParams(req);

        expect(result).toEqual({
            amount: {
                $gte: 50,
                $lte: 200,
            },
        });
    });
});

describe("findExistingMembers", () => {
    test("should return the correct result object", async () => {
        const memberEmails = [
            "email1@example.com",
            "email2@example.com",
            "email3@example.com",
        ];

        jest.spyOn(User, "findOne")
            .mockResolvedValueOnce({ email: "email1@example.com" })
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ email: "email3@example.com" });
        jest.spyOn(Group, "findOne")
            .mockResolvedValueOnce({
                members: [
                    {
                        email: "email1@example.com",
                    },
                ],
            })
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        const result = await findExistingMembers(memberEmails);

        expect(result).toEqual({
            existingMembers: ["email1@example.com", "email3@example.com"],
            alreadyInGroupMembers: ["email1@example.com"],
            notFoundMembers: ["email2@example.com"],
        });
    });
});
