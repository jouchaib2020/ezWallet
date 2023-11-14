import { app } from "../app";
import { User, Group } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth, findExistingMembers } from "../controllers/utils.js";
import {
    getGroup,
    getGroups,
    getUser,
    getUsers,
    createGroup,
    addToGroup,
    removeFromGroup,
    deleteGroup,
    deleteUser,
} from "../controllers/users";

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js");
jest.mock("../controllers/utils.js");
jest.mock("../models/model.js");

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
    User.find.mockClear();
    User.findOne.mockClear();
    verifyAuth.mockClear();
    Group.deleteOne.mockClear();
    User.deleteOne.mockClear();
    transactions.deleteMany.mockClear();
    Group.updateOne.mockClear();

    //additional `mockClear()` must be placed here
});

describe("getUsers", () => {
    test("should return empty list if there are no users", async () => {
        //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        verifyAuth.mockReturnValueOnce({ authorized: true });
        jest.spyOn(User, "find").mockResolvedValue([]);

        await getUsers(mockReq, mockRes);

        expect(User.find).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });

    test("should retrieve list of all users", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const retrievedUsers = [
            {
                username: "test1",
                email: "test1@example.com",
                password: "hashedPassword1",
            },
            {
                username: "test2",
                email: "test2@example.com",
                password: "hashedPassword2",
            },
        ];
        verifyAuth.mockReturnValueOnce({ authorized: true });
        jest.spyOn(User, "find").mockResolvedValue(retrievedUsers);

        await getUsers(mockReq, mockRes);

        expect(User.find).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: retrievedUsers,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });

    test("should return error if user is not admin", async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        verifyAuth.mockReturnValueOnce({ authorized: false });

        await getUsers(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized",
        });
    });

    test("should handle internal server errors", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the authentication check
        verifyAuth.mockReturnValue({ authorized: true });

        // Mock the Group.find() method to throw an error
        const errorMessage = "Internal server error";
        User.find.mockRejectedValueOnce(new Error(errorMessage));

        await getUsers(req, res);

        // Verify that the authentication check is called
        expect(verifyAuth).toHaveBeenCalledWith(req, res, {
            authType: "Admin",
        });

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });
});

describe("getUser", () => {
    test("should return 400 if the user does not exist", async () => {
        const mockReq = {
            params: {
                username: "test1",
            },
            cookies: {
                accessToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };

        User.findOne.mockResolvedValue(null);
        await getUser(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ error: "User not found" });
        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return error if non-Admin tries to get other than their account", async () => {
        const mockReq = {
            params: {
                username: "test1",
            },
            cookies: {
                accessToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const retrievedUser = {
            username: "test2",
            email: "test2@example.com",
            password: "hashedPassword2",
        };
        verifyAuth.mockReturnValue({ authorized: false });
        jest.spyOn(User, "findOne").mockResolvedValueOnce(retrievedUser);
        jest.spyOn(User, "findOne").mockResolvedValueOnce({
            username: "test1",
        }); // Mocking the logged in user

        await getUser(mockReq, mockRes);

        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("should retrieve user info for admin", async () => {
        const mockReq = {
            params: {
                username: "test1",
            },
            cookies: {
                accessToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        User.findOne.mockImplementation(() => ({
            username: "test1",
            email: "test1@example.com",
            role: "Regular",
        }));

        await getUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test("should retrieve user info for non-admin", async () => {
        const mockReq = {
            params: {
                username: "test1",
            },
            cookies: {
                accessToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };

        verifyAuth.mockReturnValueOnce({ authorized: false });
        verifyAuth.mockReturnValueOnce({ authorized: true });

        const retrievedUser = {
            username: "test1",
            email: "test1@example.com",
            role: "Regular",
        };
        jest.spyOn(User, "findOne").mockResolvedValue(retrievedUser);

        await getUser(mockReq, mockRes);

        expect(User.findOne).toHaveBeenCalledWith({ username: "test1" });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: retrievedUser,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });

    test("should handle internal server errors", async () => {
        const req = {
            params: {
                username: "username",
            },
            cookies: {
                accessToken: "mockedRefreshToken",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the Group.find() method to throw an error
        const errorMessage = "Internal server error";
        User.findOne.mockRejectedValueOnce(new Error(errorMessage));

        await getUser(req, res);

        // Verify that the authentication check is called

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });
});

describe("createGroup", () => {
    beforeEach(() => {
        Group.findOne.mockClear();
        Group.create.mockClear();
        User.findOne.mockClear();
        findExistingMembers.mockClear();
        verifyAuth.mockClear();
    });

    test("should create a new group when caller email encluded in the request", async () => {
        const mockReq = {
            body: {
                name: "Test Group",
                memberEmails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const existingMembers = ["member1@example.com", "member2@example.com"];
        const notFoundMembers = ["member3@example.com"];
        const alreadyInGroupMembers = [];

        verifyAuth.mockReturnValueOnce({ authorized: true });
        User.findOne.mockResolvedValueOnce({
            username: "member1",
            email: "member1@example.com",
            password: "hashedPassword1",
        });
        Group.findOne.mockResolvedValueOnce(null);
        findExistingMembers.mockResolvedValueOnce({
            existingMembers: existingMembers,
            notFoundMembers: notFoundMembers,
            alreadyInGroupMembers: alreadyInGroupMembers,
        });

        const createdGroup = {
            name: "Test Group",
            members: existingMembers,
        };
        User.findOne.mockResolvedValueOnce({ id: "userId1" });
        User.findOne.mockResolvedValueOnce({ id: "userId2" });

        Group.create.mockResolvedValueOnce(createdGroup);

        await createGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockReq.body.name });
        expect(Group.create).toHaveBeenCalledWith({
            name: mockReq.body.name,
            members: [
                {
                    email: "member1@example.com",
                    user: "userId1",
                },
                {
                    email: "member2@example.com",
                    user: "userId2",
                },
            ],
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                group: createdGroup,
                alreadyInGroup: alreadyInGroupMembers,
                membersNotFound: notFoundMembers,
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });

    test("should create a new group when caller email not encluded in the request", async () => {
        const mockReq = {
            body: {
                name: "Test Group",
                memberEmails: ["member2@example.com", "member3@example.com"],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const existingMembers = ["member2@example.com"];
        const notFoundMembers = ["member3@example.com"];
        const alreadyInGroupMembers = [];

        verifyAuth.mockReturnValueOnce({ authorized: true });
        User.findOne.mockResolvedValueOnce({
            username: "member1",
            email: "member1@example.com",
        });
        Group.findOne.mockResolvedValueOnce(null);
        Group.findOne.mockResolvedValueOnce(null);
        findExistingMembers.mockResolvedValueOnce({
            existingMembers: existingMembers,
            notFoundMembers: notFoundMembers,
            alreadyInGroupMembers: alreadyInGroupMembers,
        });

        const createdGroup = {
            name: "Test Group",
            members: existingMembers,
        };
        User.findOne.mockResolvedValueOnce({ id: "userId2" });
        User.findOne.mockResolvedValueOnce({ id: "userId1" });

        Group.create.mockResolvedValueOnce(createdGroup);

        await createGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockReq.body.name });
        expect(Group.create).toHaveBeenCalledWith({
            name: mockReq.body.name,
            members: [
                {
                    email: "member2@example.com",
                    user: "userId2",
                },
                {
                    email: "member1@example.com",
                    user: "userId1",
                },
            ],
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                group: createdGroup,
                alreadyInGroup: alreadyInGroupMembers,
                membersNotFound: notFoundMembers,
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });

    test("should return a error if request body is missing attributes", async () => {
        const mockReq = {
            body: {
                memberEmails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await createGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Missing request body attributes",
        });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return error if the group name passed in the request body is an empty string", async () => {
        const mockReq = {
            body: {
                name: "",
                memberEmails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await createGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "invalid request body",
        });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return error if group name is already registered", async () => {
        const mockReq = {
            body: {
                name: "existing Group",
                memberEmails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const existingGroup = { name: "existing Group" };

        verifyAuth.mockReturnValueOnce({ authorized: true });
        User.findOne.mockResolvedValueOnce({
            email: "member1@example.com",
        });
        Group.findOne.mockResolvedValueOnce(existingGroup);

        await createGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalledWith({ name: mockReq.body.name });
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Group name already registered",
        });
    });

    test("should return error if user is not authenticated", async () => {
        const req = {
            body: {
                name: "Test Group",
                memberEmails: ["member1@example.com"],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        verifyAuth.mockReturnValueOnce({ authorized: false });

        await createGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Unauthorized",
        });
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test("should return an error if all member emails are already in a group", async () => {
        const req = {
            body: {
                name: "Test Group",
                memberEmails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const user = {
            email: "example@example",
        };

        User.findOne.mockResolvedValueOnce(user);
        Group.findOne.mockResolvedValueOnce(null);

        verifyAuth.mockReturnValue({ authorized: true });
        // Mocking the findExistingMembers function
        findExistingMembers.mockResolvedValueOnce({
            existingMembers: [
                "member1@example.com",
                "member2@example.com",
                "member3@example.com",
            ],
            notFoundMembers: [],
            alreadyInGroupMembers: [
                "member1@example.com",
                "member2@example.com",
                "member3@example.com",
            ],
        });

        await createGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "all the provided emails are already in a group or do not exist in the database",
        });
        expect(Group.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalled();
        expect(findExistingMembers).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return error if all the provided emails do not exist in the database", async () => {
        const req = {
            body: {
                name: "Test Group",
                memberEmails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const user = {
            email: "example@example",
        };

        User.findOne.mockResolvedValueOnce(user);
        Group.findOne.mockResolvedValueOnce(null);

        verifyAuth.mockReturnValue({ authorized: true });
        // Mocking the findExistingMembers function
        findExistingMembers.mockResolvedValueOnce({
            existingMembers: [],
            notFoundMembers: [
                "member1@example.com",
                "member2@example.com",
                "member3@example.com",
            ],
            alreadyInGroupMembers: [],
        });

        await createGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "all the provided emails are already in a group or do not exist in the database",
        });
        expect(Group.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalled();
        expect(findExistingMembers).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return error if the caller is already in a group and his email is encluded in the request", async () => {
        const mockReq = {
            body: {
                name: "Test Group",
                memberEmails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const existingMembers = ["member1@example.com", "member2@example.com"];
        const notFoundMembers = ["member3@example.com"];
        const alreadyInGroupMembers = ["member1@example.com"];

        verifyAuth.mockReturnValueOnce({ authorized: true });
        User.findOne.mockResolvedValueOnce({
            username: "member1",
            email: "member1@example.com",
        });
        Group.findOne.mockResolvedValueOnce(null);
        findExistingMembers.mockResolvedValueOnce({
            existingMembers: existingMembers,
            notFoundMembers: notFoundMembers,
            alreadyInGroupMembers: alreadyInGroupMembers,
        });

        await createGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "the user who calls the API is already in a group",
        });
        expect(Group.findOne).toHaveBeenCalledWith({ name: mockReq.body.name });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return error if the caller is already in a group and his email is not encluded in the request", async () => {
        const mockReq = {
            body: {
                name: "Test Group",
                memberEmails: ["member2@example.com", "member3@example.com"],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const existingMembers = ["member2@example.com"];
        const notFoundMembers = ["member3@example.com"];
        const alreadyInGroupMembers = [];

        verifyAuth.mockReturnValueOnce({ authorized: true });
        User.findOne.mockResolvedValueOnce({
            username: "member1",
            email: "member1@example.com",
        });
        Group.findOne.mockResolvedValueOnce(null);
        Group.findOne.mockResolvedValueOnce({ name: "GroupName" });

        findExistingMembers.mockResolvedValueOnce({
            existingMembers: existingMembers,
            notFoundMembers: notFoundMembers,
            alreadyInGroupMembers: alreadyInGroupMembers,
        });

        await createGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "the user who calls the API is already in a group",
        });
        expect(Group.findOne).toHaveBeenCalledWith({ name: mockReq.body.name });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return error if at least one of the member emails is not in a valid email format", async () => {
        const req = {
            body: {
                name: "Test Group",
                memberEmails: [
                    "InvalidEmailFormat",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "invalid request body",
        });
    });

    test("should return error if at least one of the member emails is an empty string", async () => {
        const req = {
            body: {
                name: "Test Group",
                memberEmails: [
                    "",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "invalid request body",
        });
    });

    test("should return error  if group name is already registered", async () => {
        const mockReq = {
            body: {
                name: "existing Group",
                memberEmails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ authorized: false });

        await createGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized",
        });
        expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test("should handle internal server errors", async () => {
        const mockReq = {
            body: {
                name: "existing Group",
                memberEmails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
            cookies: {
                refreshToken: "mockedRefreshToken",
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ authorized: true });
        // Mock the Group.find() method to throw an error
        const errorMessage = "Internal server error";
        Group.findOne.mockRejectedValueOnce(new Error(errorMessage));

        await createGroup(mockReq, mockRes);

        // Verify the response
        expect(mockRes.json).toHaveBeenCalledWith(errorMessage);
        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
});

describe("getGroups", () => {
    test("should return all the groups", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };

        verifyAuth.mockReturnValueOnce({ authorized: true });

        // Mock the Group.find() method to return some sample data
        const sampleGroups = [
            {
                name: "Group 1",
                members: ["User 1", "User 2"],
            },
            {
                name: "Group 2",
                members: ["User 3", "User 4"],
            },
        ];
        Group.find.mockResolvedValueOnce(sampleGroups);

        await getGroups(req, res);

        // Verify that the authentication check is called
        expect(verifyAuth).toHaveBeenCalledWith(req, res, {
            authType: "Admin",
        });

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: sampleGroups,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    });

    test("should return an empty array if there are no groups", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };

        verifyAuth.mockReturnValueOnce({ authorized: true });

        // Mock the Group.find() method to return an empty array
        Group.find.mockResolvedValueOnce([]);

        await getGroups(req, res);

        // Verify that the authentication check is called
        expect(verifyAuth).toHaveBeenCalledWith(req, res, {
            authType: "Admin",
        });

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    });

    test("should return error when called by an authenticated user who is not an admin", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the authentication check to return unauthorized
        verifyAuth.mockReturnValueOnce({ authorized: false });

        await getGroups(req, res);

        // Verify that the authentication check is called
        expect(verifyAuth).toHaveBeenCalledWith(req, res, {
            authType: "Admin",
        });

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("should handle internal server errors", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the authentication check
        verifyAuth.mockReturnValueOnce({ authorized: true });

        // Mock the Group.find() method to throw an error
        const errorMessage = "Internal server error";
        Group.find.mockRejectedValueOnce(new Error(errorMessage));

        await getGroups(req, res);

        // Verify that the authentication check is called
        expect(verifyAuth).toHaveBeenCalledWith(req, res, {
            authType: "Admin",
        });

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(errorMessage);
    });
});

describe("getGroup", () => {
    beforeEach(() => {
        Group.findOne.mockClear();
        User.findOne.mockClear();
        verifyAuth.mockClear();
    });

    test("should retrieve group info", async () => {
        const req = {
            params: {
                name: "groupName",
            },
        };
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "mockedRefreshedTokenMessage",
            },
        };
        const group = {
            name: "Group 1",
            members: ["User 1", "User 2"],
        };
        verifyAuth.mockReturnValue({ authorized: true });
        Group.findOne.mockResolvedValue(group);

        await getGroup(req, res);

        expect(Group.findOne).toHaveBeenCalledWith({ name: req.params.name });
        expect(verifyAuth).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            data: group,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return if the requested group does not exist", async () => {
        const req = {
            params: {
                name: "nonexistent-group",
            },
        };
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        verifyAuth.mockReturnValue({ authorized: true });
        Group.findOne.mockResolvedValue(null);

        await getGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
    });

    test("returns error if user is not an admin and not a member of the group", async () => {
        const req = {
            params: { name: "group-name" },
        };
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        const group = {
            name: "group-name",
            members: [
                { email: "User 1", id: "Id1" },
                { email: "User 1", id: "Id2" },
            ],
        };
        verifyAuth.mockReturnValueOnce({ authorized: true });
        verifyAuth.mockReturnValueOnce({ authorized: false });
        verifyAuth.mockReturnValueOnce({ authorized: false });
        Group.findOne.mockResolvedValueOnce(group);

        await getGroup(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: "Unauthorized",
        });
        expect(verifyAuth).toHaveBeenCalled();
        expect(Group.findOne).toHaveBeenCalledWith({
            name: "group-name",
        });
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test("should handle internal server errors", async () => {
        const req = {
            params: {
                name: "groupName",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the Group.find() method to throw an error
        const errorMessage = "Internal server error";
        Group.findOne.mockRejectedValueOnce(new Error(errorMessage));

        await getGroup(req, res);
        // Verify the response
        expect(res.json).toHaveBeenCalledWith(errorMessage);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe("addToGroup", () => {
    beforeEach(() => {
        Group.findOne.mockClear();
        verifyAuth.mockClear();
    });

    test("should add new members to a group", async () => {
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };

        const group = {
            name: "groupName",
            members: [
                { email: "existingMember1@example.com", user: "fakeUserId" },
            ],
            save: jest.fn().mockResolvedValueOnce({
                name: "groupName",
                members: [
                    {
                        email: "existingMember1@example.com",
                        user: "fakeUserId",
                    },
                    { email: "member1@example.com", user: "fakeUserId" },
                ],
            }),
        };
        Group.findOne.mockResolvedValueOnce(group);
        verifyAuth.mockReturnValue({ authorized: true });
        // Mocking the findExistingMembers function
        findExistingMembers.mockResolvedValueOnce({
            existingMembers: ["member1@example.com", "member2@example.com"],
            notFoundMembers: ["member3@example.com"],
            alreadyInGroupMembers: ["member2@example.com"],
        });
        User.findOne.mockResolvedValueOnce({
            email: "member1@example.com",
            user: "fakeUserId",
        });

        // Mocking the findOne method of the User model

        await addToGroup(req, res);

        expect(Group.findOne).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalled();
        expect(findExistingMembers).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            data: {
                group: {
                    name: "groupName",
                    members: [
                        {
                            email: "existingMember1@example.com",
                            user: "fakeUserId",
                        },
                        { email: "member1@example.com", user: "fakeUserId" },
                    ],
                },
                alreadyInGroup: ["member2@example.com"],
                membersNotFound: ["member3@example.com"],
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return an error if the group does not exist", async () => {
        const req = {
            params: {
                name: "nonExistingGroup",
            },
            body: {
                emails: ["member1@example.com", "member2@example.com"],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValue({ authorized: true });
        // Mocking the findOne method of the Group model to return null
        Group.findOne.mockResolvedValue(null);

        await addToGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
    });

    test("should return an error if the request body is missing attributes", async () => {
        const req = {
            params: {
                name: "ExistingGroup",
            },
            body: {},
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await addToGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Missing request body attributes",
        });
    });

    test("should return an error if all member emails are already in a group", async () => {
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };

        const group = {
            name: "groupName",
            members: [
                { email: "existingMember1@example.com", user: "fakeUserId" },
            ],
        };
        Group.findOne.mockResolvedValueOnce(group);

        verifyAuth.mockReturnValue({ authorized: true });
        // Mocking the findExistingMembers function
        findExistingMembers.mockResolvedValueOnce({
            existingMembers: [
                "member1@example.com",
                "member2@example.com",
                "member3@example.com",
            ],
            notFoundMembers: [],
            alreadyInGroupMembers: [
                "member1@example.com",
                "member2@example.com",
                "member3@example.com",
            ],
        });

        await addToGroup(req, res);

        expect(Group.findOne).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalled();
        expect(findExistingMembers).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            error: "all the provided emails are already in a group or do not exist in the database",
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return an error if all member emails do not exist", async () => {
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };

        const group = {
            name: "groupName",
            members: [
                { email: "existingMember1@example.com", user: "fakeUserId" },
            ],
        };
        Group.findOne.mockResolvedValueOnce(group);

        verifyAuth.mockReturnValue({ authorized: true });
        // Mocking the findExistingMembers function
        findExistingMembers.mockResolvedValueOnce({
            existingMembers: [],
            notFoundMembers: [
                "member1@example.com",
                "member2@example.com",
                "member3@example.com",
            ],
            alreadyInGroupMembers: [],
        });

        await addToGroup(req, res);

        expect(Group.findOne).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalled();
        expect(findExistingMembers).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            error: "all the provided emails are already in a group or do not exist in the database",
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return error if at least one of the member emails is not in a valid email format", async () => {
        const req = {
            params: {
                name: "ExistingGroup",
            },
            body: {
                emails: [
                    "badEmailFormat",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await addToGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "invalid request body",
        });
    });

    test("should return error if at least one of the member emails is an empty string", async () => {
        const req = {
            params: {
                name: "ExistingGroup",
            },
            body: {
                emails: ["", "member2@example.com", "member3@example.com"],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await addToGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "invalid request body",
        });
    });

    test("should return error if user is not authenticated", async () => {
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };

        verifyAuth.mockReturnValueOnce({ authorized: false });
        verifyAuth.mockReturnValueOnce({ authorized: false });

        await addToGroup(req, res);

        expect(verifyAuth).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test("should return error if called by an authenticated user who is not admin and not part of the group", async () => {
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: [
                    "member1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };

        const group = {
            name: "groupName",
            members: [
                { email: "existingMember1@example.com", user: "fakeUserId" },
            ],
        };

        Group.findOne.mockResolvedValueOnce(group);

        verifyAuth.mockReturnValueOnce({ authorized: true });
        verifyAuth.mockReturnValueOnce({ authorized: false });
        verifyAuth.mockReturnValueOnce({ authorized: true });

        // Mocking the findOne method of the User model

        await addToGroup(req, res);

        expect(Group.findOne).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test("should handle internal server errors", async () => {
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: ["example1@example.com"],
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the Group.find() method to throw an error
        const errorMessage = "Internal server error";
        Group.findOne.mockRejectedValueOnce(new Error(errorMessage));

        await addToGroup(req, res);

        // Verify the response
        expect(res.json).toHaveBeenCalledWith(errorMessage);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe("removeFromGroup", () => {
    beforeEach(() => {
        Group.findOne.mockClear();
        verifyAuth.mockClear();
        // Additional `mockClear()` for other dependencies if necessary
    });

    test("should remove members from a group", async () => {
        // Mock request and response objects
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: [
                    "existingMember2@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };
        const group = {
            name: "groupName",
            members: [
                { email: "existingMember1@example.com", user: "fakeUserId" },
                { email: "existingMember2@example.com", user: "fakeUserId" },
            ],
            save: jest.fn().mockResolvedValueOnce({
                name: "groupName",
                members: [
                    {
                        email: "existingMember1@example.com",
                        user: "fakeUserId",
                    },
                ],
            }),
        };

        Group.findOne.mockResolvedValueOnce(group); // Mock existing group

        verifyAuth.mockReturnValueOnce({ authorized: true }); // Mock the authentication check

        findExistingMembers.mockResolvedValueOnce({
            existingMembers: [
                "existingMember2@example.com",
                "member2@example.com",
            ],
            alreadyInGroupMembers: ["existingMember2@example.com"],
            notFoundMembers: ["member3@example.com"],
        });
        // Call the function
        await removeFromGroup(req, res);

        // Verify the response
        expect(Group.findOne).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalled();
        expect(findExistingMembers).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            data: {
                group: {
                    name: "groupName",
                    members: [
                        {
                            email: "existingMember1@example.com",
                            user: "fakeUserId",
                        },
                    ],
                },
                notInGroup: ["member2@example.com"],
                membersNotFound: ["member3@example.com"],
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return a 400 error if the request body is missing attributes", async () => {
        const req = {
            params: {
                name: "ExistingGroup",
            },
            body: {},
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await addToGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Missing request body attributes",
        });
    });

    test("should return 400 if group does not exist", async () => {
        // Mock request and response objects
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: [
                    "existingMember2@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };

        Group.findOne.mockResolvedValueOnce(null); // Mock existing group
        // Call the function
        await removeFromGroup(req, res);

        // Verify the response
        expect(Group.findOne).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return error if all the provided emails do not belong to the group ", async () => {
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: ["member2@example.com", "member3@example.com"],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };
        const group = {
            name: "groupName",
            members: [
                { email: "existingMember1@example.com", user: "fakeUserId" },
                { email: "existingMember2@example.com", user: "fakeUserId" },
            ],
            save: jest.fn().mockResolvedValueOnce({
                name: "groupName",
                members: [
                    {
                        email: "existingMember1@example.com",
                        user: "fakeUserId",
                    },
                ],
            }),
        };

        Group.findOne.mockResolvedValueOnce(group); // Mock existing group

        verifyAuth.mockReturnValueOnce({ authorized: true }); // Mock the authentication check

        findExistingMembers.mockResolvedValueOnce({
            existingMembers: ["member2@example.com"],
            alreadyInGroupMembers: [],
            notFoundMembers: ["member3@example.com"],
        });
        // Call the function
        await removeFromGroup(req, res);

        // Verify the response
        expect(Group.findOne).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalled();
        expect(findExistingMembers).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            error: "all the provided emails do not belong to the group or do not exist in the database",
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return error if all the provided emails do not exist in the database ", async () => {
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: ["member2@example.com", "member3@example.com"],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };
        const group = {
            name: "groupName",
            members: [
                { email: "existingMember1@example.com", user: "fakeUserId" },
                { email: "existingMember2@example.com", user: "fakeUserId" },
            ],
            save: jest.fn().mockResolvedValueOnce({
                name: "groupName",
                members: [
                    {
                        email: "existingMember1@example.com",
                        user: "fakeUserId",
                    },
                ],
            }),
        };

        Group.findOne.mockResolvedValueOnce(group); // Mock existing group

        verifyAuth.mockReturnValueOnce({ authorized: true }); // Mock the authentication check

        findExistingMembers.mockResolvedValueOnce({
            existingMembers: [],
            alreadyInGroupMembers: [],
            notFoundMembers: ["member2@example.com", "member3@example.com"],
        });
        // Call the function
        await removeFromGroup(req, res);

        // Verify the response
        expect(Group.findOne).toHaveBeenCalled();
        expect(verifyAuth).toHaveBeenCalled();
        expect(findExistingMembers).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            error: "all the provided emails do not belong to the group or do not exist in the database",
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return error if at least one of the member emails is not in a valid email format", async () => {
        const req = {
            params: {
                name: "ExistingGroup",
            },
            body: {
                emails: [
                    "badEmailFormat",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await removeFromGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "invalid request body",
        });
    });

    test("should return error if at least one of the member emails is an empty string", async () => {
        const req = {
            params: {
                name: "ExistingGroup",
            },
            body: {
                emails: ["", "member2@example.com", "member3@example.com"],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await removeFromGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "invalid request body",
        });
    });

    test("should return error if the group contains only one member before deleting any user", async () => {
        // Mock request and response objects
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: [
                    "existingMember1@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };
        const group = {
            name: "groupName",
            members: [
                { email: "existingMember1@example.com", user: "fakeUserId" },
            ],
        };

        Group.findOne.mockResolvedValueOnce(group); // Mock existing group

        // Call the function
        await removeFromGroup(req, res);

        // Verify the response
        expect(Group.findOne).toHaveBeenCalled();

        expect(res.json).toHaveBeenCalledWith({
            error: "the group contains only one member",
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return a 401 error if called by an authenticated user who is not part of the group and not admin", async () => {
        // Mock request and response objects
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: [
                    "existingMember2@example.com",
                    "member2@example.com",
                    "member3@example.com",
                ],
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };

        const group = {
            name: "groupName",
            members: [
                { email: "existingMember1@example.com", user: "fakeUserId" },
                { email: "existingMember2@example.com", user: "fakeUserId" },
            ],
        };

        Group.findOne.mockResolvedValueOnce(group); // Mock existing group

        verifyAuth.mockReturnValue({ authorized: false }); // Mock existing group
        // Call the function
        await removeFromGroup(req, res);

        // Verify the response
        expect(Group.findOne).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test("should handle internal server errors", async () => {
        const req = {
            params: {
                name: "groupName",
            },
            body: {
                emails: ["example1@example.com"],
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the Group.find() method to throw an error
        const errorMessage = "Internal server error";
        Group.findOne.mockRejectedValueOnce(new Error(errorMessage));

        await removeFromGroup(req, res);

        // Verify the response
        expect(res.json).toHaveBeenCalledWith(errorMessage);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe("deleteUser", () => {
    test("should delete a user and related transactions", async () => {
        const mockReq = {
            body: {
                email: "test@example.com",
            },
        };

        const mockRes = {
            status: jest.fn(() => mockRes),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Token refreshed successfully",
            },
        };

        // Mock the verifyAuth function to return an authorized admin
        verifyAuth.mockReturnValue({ authorized: true });

        // Mock the User.findOne function to return the user to be deleted
        User.findOne.mockResolvedValueOnce({
            username: "testuser",
            role: "Regular",
        });

        // Mock the User.deleteOne function
        User.deleteOne.mockImplementation(() => {});

        transactions.find.mockResolvedValue(true);

        transactions.deleteMany.mockResolvedValue({
            deletedCount: 1,
        });

        Group.findOne.mockResolvedValue({
            members: ["uno", "due"],
        });

        Group.updateOne.mockResolvedValueOnce({
            modifiedCount: 1,
        });

        await deleteUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                deletedTransactions: 1,
                deletedFromGroup: true,
            },
            refreshedTokenMessage: "Token refreshed successfully",
        });
    });

    test("should return error if the requester is not an admin", async () => {
        const mockReq = {
            body: {
                email: "test@example.com",
            },
        };

        const mockRes = {
            status: jest.fn(() => mockRes),
            json: jest.fn(),
        };

        // Mock the verifyAuth function to return an unauthorized user
        verifyAuth.mockReturnValue({ authorized: false });

        await deleteUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized",
        });
    });

    test("should return error if the request body is missing the email", async () => {
        const mockReq = {
            body: {},
        };

        const mockRes = {
            status: jest.fn(() => mockRes),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ authorized: true });
        await deleteUser(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Email property missing in the request body",
        });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return error if the request body is empty", async () => {
        const mockReq = {
            body: {},
        };

        const mockRes = {
            status: jest.fn(() => mockRes),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ authorized: true });
        await deleteUser(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Email property missing in the request body",
        });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return error if the email in the request body is in the wrong format", async () => {
        const mockReq = {
            body: {
                email: "wrongFormat",
            },
        };

        const mockRes = {
            status: jest.fn(() => mockRes),
            json: jest.fn(),
        };

        verifyAuth.mockReturnValueOnce({ authorized: true });
        await deleteUser(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Wrong email format",
        });
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return an error if the provided email does not exist in the database", async () => {
        const mockReq = {
            body: {
                email: "nonexistent@example.com",
            },
        };

        const mockRes = {
            status: jest.fn(() => mockRes),
            json: jest.fn(),
        };

        // Mock the verifyAuth function to return an authorized admin
        verifyAuth.mockReturnValue({ authorized: true });

        // Mock the User.findOne function to return null (user does not exist)
        User.findOne.mockResolvedValueOnce(null);

        await deleteUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "The provided email is not associated to any account",
        });
    });
});

describe("deleteGroup", () => {
    test("should delete the group and return success message", async () => {
        // Mock necessary variables and request objects
        const req = {
            body: {
                name: "Family",
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "refreshedTokenMessage",
            },
        };

        // Mock the Group.findOne() to return a group
        const mockGroup = {
            _id: "group_id",
            name: "Family",
            members: ["member1", "member2"],
        };
        Group.findOne.mockResolvedValueOnce(mockGroup);

        // Call the deleteGroup function
        await deleteGroup(req, res);

        // Check the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: { message: "Group deleted successfully" },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });

        // Check if Group.findOne() and Group.deleteOne() were called correctly
        expect(Group.findOne).toHaveBeenCalledWith({ name: "Family" });
        expect(Group.deleteOne).toHaveBeenCalledWith({ name: "Family" });
    });

    test("should return error if the group does not exist", async () => {
        // Mock necessary variables and request objects
        const req = {
            body: {
                name: "Family",
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the Group.findOne() to return null, indicating that the group doesn't exist
        Group.findOne.mockResolvedValueOnce(null);

        // Call the deleteGroup function
        await deleteGroup(req, res);

        // Check the response
        expect(Group.findOne).toHaveBeenCalledWith({ name: "Family" });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "The provided group does not exist",
        });

        // Check if Group.findOne() was called correctly
    });
});
