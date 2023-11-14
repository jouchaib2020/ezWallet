import request from "supertest";
import { app } from "../app";
import { User, Group } from "../models/User.js";
import { transactions, categories } from "../models/model";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();
let user, user2, admin;
const adminTokens =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU5NjU5MDQsImV4cCI6MTcxNzUwMjMzNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluIiwicm9sZSI6IkFkbWluIn0.F8XD5vrNWhHQO6kJK-uzjJs32M5S30WZDE5SVylet7w";

const userToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU5NjU5MDQsImV4cCI6MTcxNzUwODI4MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiUGVwcGUiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwicm9sZSI6IlJlZ3VsYXIifQ.ZkTtb3GkDPHI5rk777v-neon0E9cO5CFSe8mh8I-A6g";

beforeAll(async () => {
    const dbName = "testingDatabaseUsers";
    const url = `${process.env.MONGO_URI}/${dbName}`;

    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe("getUsers", () => {
    beforeEach(async () => {
        admin = await User.create({
            username: "admin",
            email: "admin@example.com",
            password: "password",
            refreshToken: adminTokens,
            role: "Admin",
        });
    });
    afterEach(async () => {
        await User.deleteMany();
    });

    test("should return list of users", async () => {
        user = await User.create({
            username: "user1",
            email: "user1@example.com",
            password: "password1",
            role: "Regular",
        });
        const response = await request(app)
            .get("/api/users")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);
        expect(response.body.data[0].username).toBe("admin");
        expect(response.body.data[0].email).toBe("admin@example.com");
        expect(response.body.data[0].role).toBe("Admin");
        expect(response.body.data[1].username).toBe("user1");
        expect(response.body.data[1].email).toBe("user1@example.com");
        expect(response.body.data[1].role).toBe("Regular");
    });

    test("should return an empty array if there are no users", async () => {
        // Delete all users from the database
        await User.deleteMany({});

        // Send a GET request to the '/users' endpoint
        const response = await request(app)
            .get("/api/users")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );

        // Expect a 200 OK response
        expect(response.status).toBe(200);

        // Expect the response body to have a 'data' property containing an empty array
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(0);
    });

    test("should return error if user is not admin", async () => {
        user = await User.create({
            username: "user1",
            email: "user1@example.com",
            password: "password1",
            refreshToken: userToken,
            role: "Regular",
        });
        const response = await request(app)
            .get("/api/users")
            .set(
                "Cookie",
                `accessToken=${userToken};refreshToken=${userToken}`
            );

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Unauthorized");
    });
});

describe("getUser", () => {
    beforeEach(async () => {
        // Create a test user before each test case
        user = await User.create({
            username: "testuser",
            email: "testuser@example.com",
            password: "testpassword",
            refreshToken: userToken,
            role: "Regular",
        });
        user2 = await User.create({
            username: "Peppe",
            email: "peppe@example.com",
            password: "testpassword",
            refreshToken: "blabla",
            role: "Regular",
        });
        admin = await User.create({
            username: "testuser2",
            email: "testuser2@example.com",
            password: "testpassword",
            refreshToken: adminTokens,
            role: "Admin",
        });
    });

    afterEach(async () => {
        // Remove the test user after each test case
        await User.deleteMany();
    });

    test("should retrieve user info for admin", async () => {
        const response = await request(app)
            .get(`/api/users/testuser`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );

        expect(response.status).toBe(200);
        expect(response.body.data.username).toBe("testuser");
        expect(response.body.data.email).toBe("testuser@example.com");
        expect(response.body.data.role).toBe("Regular");
    });

    test("should retrieve user info for non-admin", async () => {
        const response = await request(app)
            .get(`/api/users/Peppe`)
            .set(
                "Cookie",
                `accessToken=${userToken};refreshToken=${userToken}`
            );

        expect(response.status).toBe(200);
        expect(response.body.data.username).toBe("Peppe");
        expect(response.body.data.email).toBe("peppe@example.com");
        expect(response.body.data.role).toBe("Regular");
    });

    test("should return error if non-Admin tries to get other than their account", async () => {
        const response = await request(app)
            .get(`/api/users/testuser2`)
            .set(
                "Cookie",
                `accessToken=${userToken};refreshToken=${userToken}`
            );

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Unauthorized");
    });

    test("should return 400 if the user does not exist", async () => {
        const nonExistentUsername = "nonExistentUserName";
        const response = await request(app)
            .get(`/api/users/${nonExistentUsername}`)
            .set(
                "Cookie",
                `accessToken=${userToken};refreshToken=${adminTokens}`
            );

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("User not found");
    });
});

describe("createGroup", () => {
    beforeEach(async () => {
        user = await User.create({
            username: "testuser1",
            email: "testuser1@example.com",
            password: "testpassword",
            refreshToken: userToken,
            role: "Regular",
        });
        admin = await User.create({
            username: "testuser2",
            email: "testuser2@example.com",
            password: "testpassword",
            refreshToken: adminTokens,
            role: "Admin",
        });
    });
    afterEach(async () => {
        // Remove the test user after each test case
        await User.deleteMany();
        await Group.deleteMany();
    });

    test("should create a new group when caller email encluded in the request", async () => {
        // Create a test group request body
        const requestBody = {
            name: "Family",
            memberEmails: ["testuser1@example.com", "testuser2@example.com"],
        };

        const response = await request(app)
            .post(`/api/groups/`)
            .send(requestBody)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );
        // Assert the response status code and data
        expect(response.status).toBe(200);
        expect(response.body.data.group.name).toBe("Family");
        expect(response.body.data.group.members.length).toBe(2);
    });

    test("should create a new group when caller email not encluded in the request", async () => {
        // Create a test group request body
        const requestBody = {
            name: "Family",
            memberEmails: ["testuser1@example.com"],
        };

        const response = await request(app)
            .post(`/api/groups/`)
            .send(requestBody)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );
        // Assert the response status code and data
        expect(response.status).toBe(200);
        expect(response.body.data.group.name).toBe("Family");
        expect(response.body.data.group.members.length).toBe(2);
    });

    test("should return error if group name is already registered", async () => {
        await Group.create({
            name: "existingGroup",
            members: [{ email: user.email, user: user.id }],
        });
        const requestBody = {
            name: "existingGroup",
            memberEmails: ["testuser1@example.com", "testuser2@example.com"],
        };
        // Send a POST request to the createGroup endpoint without required attributes
        const response = await request(app)
            .post(`/api/groups/`)
            .send(requestBody)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );
        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Group name already registered");
    });

    test("should return error if user is not authenticated ", async () => {
        const requestBody = {
            name: "existingGroup",
            memberEmails: ["testuser1@example.com", "testuser2@example.com"],
        };
        // Send a POST request to the createGroup endpoint without required attributes
        const response = await request(app)
            .post(`/api/groups/`)
            .send(requestBody)
            .set("Cookie", `accessToken=randomToken;refreshToken=randomToken`);
        // Assert the response status code and error message
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Unauthorized");
    });

    test("should return a error if request body is missing attributes", async () => {
        // Send a POST request to the createGroup endpoint without required attributes
        const response = await request(app).post(`/api/groups/`).send({});
        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing request body attributes");
    });

    test("should return error if at least one of the member emails is an empty string", async () => {
        // Send a POST request to the createGroup endpoint without required attributes
        const response = await request(app)
            .post(`/api/groups/`)
            .send({
                name: "GroupName",
                memberEmails: ["", "testuser2@example.com"],
            });
        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid request body");
    });

    test("should return error if the group name passed in the request body is an empty string", async () => {
        // Send a POST request to the createGroup endpoint without required attributes
        const response = await request(app)
            .post(`/api/groups/`)
            .send({
                name: "",
                memberEmails: [
                    "testuser1@example.com",
                    "testuser2@example.com",
                ],
            });
        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid request body");
    });

    test("should return error if all the provided emails do not exist in the database", async () => {
        // Create a test group request body
        const requestBody = {
            name: "Family",
            memberEmails: [
                "nonExistingEmail1@example.com",
                "nonExistingEmail2@example.com",
            ],
        };

        const response = await request(app)
            .post(`/api/groups/`)
            .send(requestBody)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );
        // Assert the response status code and data
        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "all the provided emails are already in a group or do not exist in the database"
        );
    });

    test("should return an error if all member emails are already in a group", async () => {
        await Group.create({
            name: "Group 1",
            members: [
                {
                    email: admin.email,
                    user: admin.id,
                },
                {
                    email: user.email,
                    user: user.id,
                },
            ],
        });
        const requestBody = {
            name: "Family",
            memberEmails: [user.email, admin.email],
        };

        const response = await request(app)
            .post(`/api/groups/`)
            .send(requestBody)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );
        // Assert the response status code and data
        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "all the provided emails are already in a group or do not exist in the database"
        );
    });

    test("should return error if at least one of the member emails is not in a valid email format", async () => {
        // Send a POST request to the createGroup endpoint without required attributes
        const response = await request(app)
            .post(`/api/groups/`)
            .send({
                name: "GroupName",
                memberEmails: ["InvalidFormat", "testuser2@example.com"],
            });
        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid request body");
    });

    test("should return error if the caller is already in a group and his email is encluded in the request", async () => {
        // Create a test group request body
        await Group.create({
            name: "Group 1",
            members: [
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });

        const requestBody = {
            name: "Family",
            memberEmails: [user.email],
        };

        const response = await request(app)
            .post(`/api/groups/`)
            .send(requestBody)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );
        // Assert the response status code and data
        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "the user who calls the API is already in a group"
        );
    });

    test("should return error if the caller is already in a group and his email is not encluded in the request", async () => {
        // Create a test group request body
        await Group.create({
            name: "Group 1",
            members: [
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });

        const requestBody = {
            name: "Family",
            memberEmails: [user.email, admin.email],
        };

        const response = await request(app)
            .post(`/api/groups/`)
            .send(requestBody)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );
        // Assert the response status code and data
        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "the user who calls the API is already in a group"
        );
    });
});

describe("getGroups", () => {
    beforeEach(async () => {
        user = await User.create({
            username: "testuser1",
            email: "testuser1@example.com",
            password: "testpassword",
            refreshToken: userToken,
            role: "Regular",
        });
        admin = await User.create({
            username: "admin",
            email: "admin@example.com",
            password: "adminpassword",
            refreshToken: adminTokens,
            role: "Admin",
        });
        await Group.create({
            name: "Group 1",
            members: [
                {
                    email: "testuser1@example.com",
                    user: user.id,
                },
                {
                    email: "admin@example.com",
                    user: admin.id,
                },
            ],
        });
    });
    afterEach(async () => {
        // Remove the test user after each test case
        await User.deleteMany();
        await Group.deleteMany();
    });

    test("should return all the groups", async () => {
        // Perform the API request
        const res = await request(app)
            .get("/api/groups")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );
        // Assert the response
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].name).toBe("Group 1");
        expect(res.body.data[0].members).toHaveLength(2);
        expect(res.body.data[0].members[0].email).toBe("testuser1@example.com");
        expect(res.body.data[0].members[1].email).toBe("admin@example.com");
    });

    test("should return an empty array if there are no groups", async () => {
        // Create a sample admin user

        await Group.deleteMany({});
        // Perform the API request
        const res = await request(app)
            .get("/api/groups")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );
        // Assert the response
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    test("should return error when called by an authenticated user who is not an admin", async () => {
        const res = await request(app)
            .get("/api/groups")
            .set(
                "Cookie",
                `accessToken=${userToken};refreshToken=${userToken}`
            );

        // Assert the response
        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Unauthorized");
    });
});

describe("getGroup", () => {
    beforeEach(async () => {
        user = await User.create({
            username: "testuser1",
            email: "testuser1@example.com",
            password: "testpassword",
            refreshToken: userToken,
            role: "Regular",
        });
        admin = await User.create({
            username: "admin",
            email: "admin@example.com",
            password: "adminpassword",
            refreshToken: adminTokens,
            role: "Admin",
        });
    });
    afterEach(async () => {
        // Remove the test user after each test case
        await User.deleteMany();
        await Group.deleteMany();
    });

    test("should retrieve group info", async () => {
        const group = await Group.create({
            name: "Group 1",
            members: [
                {
                    email: user.email,
                    user: user.id,
                },
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });
        const response = await request(app)
            .get(`/api/groups/${group.name}`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );

        expect(response.status).toBe(200);
        expect(response.body.data.name).toBe(group.name);
        expect(response.body.data.members.length).toBe(2);
        expect(response.body.data.members[0].email).toBe(user.email);
        expect(response.body.data.members[1].email).toBe(admin.email);
    });

    test("returns error if user is not an admin and not a member of the group", async () => {
        const group = await Group.create({
            name: "Group 1",
            members: [
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });
        const response = await request(app)
            .get(`/api/groups/${group.name}`)
            .set(
                "Cookie",
                `accessToken=${userToken};refreshToken=${adminTokens}`
            );

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Unauthorized");
    });

    test("should return if the requested group does not exist", async () => {
        const response = await request(app)
            .get(`/api/groups/nonExistingGroupName`)
            .set(
                "Cookie",
                `accessToken=${userToken};refreshToken=${userToken}`
            );

        expect(response.body.error).toBe("Group not found");
        expect(response.status).toBe(400);
    });
});

describe("addToGroup", () => {
    beforeEach(async () => {
        user = await User.create({
            username: "testuser1",
            email: "testuser1@example.com",
            password: "testpassword",
            refreshToken: userToken,
            role: "Regular",
        });
        admin = await User.create({
            username: "admin",
            email: "admin@example.com",
            password: "adminpassword",
            refreshToken: adminTokens,
            role: "Admin",
        });
    });
    afterEach(async () => {
        // Remove the test user after each test case
        await User.deleteMany();
        await Group.deleteMany();
    });

    test("should add new members to a group", async () => {
        const group = await Group.create({
            name: "Group 1",
            members: [
                {
                    email: user.email,
                    user: user.id,
                },
            ],
        });
        const requestBody = {
            emails: [admin.email],
        };

        const response = await request(app)
            .patch(`/api/groups/${group.name}/insert/`)
            .send(requestBody)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );

        // Assert the response status code
        expect(response.status).toBe(200);

        // Assert the response body structure and content
        expect(response.body.data).toBeDefined();
        expect(response.body.data.group).toBeDefined();
        expect(response.body.data.group.name).toBe("Group 1");
        expect(response.body.data.group.members.length).toBe(2); // Assuming the group already has one member
        expect(response.body.data.group.members[1].email).toBe(admin.email);
        expect(response.body.data.alreadyInGroup).toEqual([]);
        expect(response.body.data.membersNotFound).toEqual([]);
    });

    test("should return an error if the group does not exist", async () => {
        const response = await request(app)
            .patch("/api/groups/Nonexistent Group/add/")
            .send({ emails: ["newmember@example.com"] })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );

        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Group not found");
    });

    test("should return an error if the request body is missing attributes", async () => {
        const response = await request(app)
            .patch("/api/groups/groupName/add/")
            .send({});

        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing request body attributes");
    });

    test("should return an error if all member emails are already in a group", async () => {
        // Create a group and add a member
        const group = await Group.create({
            name: "Group1",
            members: [
                {
                    email: user.email,
                    user: user.id,
                },
            ],
        });
        await Group.create({
            name: "Group2",
            members: [
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });

        const response = await request(app)
            .patch(`/api/groups/${group.name}/insert`)
            .send({ emails: [admin.email] })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );

        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "all the provided emails are already in a group or do not exist in the database"
        );
    });

    test("should return an error if all member emails do not exist", async () => {
        // Create a group and add a member
        const group = await Group.create({
            name: "Group1",
            members: [
                {
                    email: user.email,
                    user: user.id,
                },
            ],
        });
        await Group.create({
            name: "Group2",
            members: [
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });

        const response = await request(app)
            .patch(`/api/groups/${group.name}/insert`)
            .send({ emails: [admin.email, "nonexistent@example.com"] })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );

        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "all the provided emails are already in a group or do not exist in the database"
        );
    });

    test("should return error if at least one of the member emails is not in a valid email format", async () => {
        const response = await request(app)
            .patch("/api/groups/Test Group/add")
            .send({ emails: ["invalidemailformat"] });

        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid request body");
    });

    test("should return error if at least one of the member emails is an empty string", async () => {
        const response = await request(app)
            .patch("/api/groups/Test Group/add")
            .send({ emails: [""] });

        // Assert the response status code and error message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid request body");
    });

    test("should return error if user is not authenticated", async () => {
        const response = await request(app)
            .patch("/api/groups/Test Group/add")
            .set("Authorization", "Bearer invalidtoken")
            .send({ emails: ["newmember@example.com"] });

        // Assert the response status code and error message
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Unauthorized");
    });

    test("should return error if called by an authenticated user who is not admin and not part of the group", async () => {
        await Group.create({
            name: "TestGroup",
            members: [
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });

        const response = await request(app)
            .patch("/api/groups/TestGroup/insert")
            .set("Cookie", `accessToken=${null};refreshToken=${null}`)
            .send({ emails: ["newmember@example.com"] });

        // Assert the response status code and error message
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Unauthorized");
    });
});

describe("removeFromGroup", () => {
    let group;

    beforeEach(async () => {
        user = await User.create({
            username: "testuser1",
            email: "testuser1@example.com",
            password: "testpassword",
            refreshToken: userToken,
            role: "Regular",
        });
        admin = await User.create({
            username: "admin",
            email: "admin@example.com",
            password: "adminpassword",
            refreshToken: adminTokens,
            role: "Admin",
        });
    });
    afterEach(async () => {
        // Remove the test user after each test case
        await User.deleteMany();
        await Group.deleteMany();
    });

    test("should remove members from a group", async () => {
        group = await Group.create({
            name: "Group Test",
            members: [
                {
                    email: user.email,
                    user: user.id,
                },
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });
        const emailsToRemove = [user.email];

        const response = await request(app)
            .patch(`/api/groups/${group.name}/pull/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ emails: emailsToRemove });

        expect(response.status).toBe(200);
        expect(response.body.data.group.name).toBe(group.name);
        expect(response.body.data.group.members.length).toBe(1);
        expect(response.body.data.notInGroup).toEqual([]);
        expect(response.body.data.membersNotFound).toEqual([]);
    });

    test("should return a 400 error if the request body is missing attributes", async () => {
        const response = await request(app)
            .patch(`/api/groups/randomName/remove/`)
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing request body attributes");
    });

    test("should return 400 if group does not exist", async () => {
        const emailsToRemove = ["member1@example.com"];

        const response = await request(app)
            .patch("/api/groups/NonExistentGroup/remove")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .send({ emails: emailsToRemove });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Group not found");
    });

    test("should return a 400 error if all provided emails do not belong to the group", async () => {
        const user2 = await User.create({
            username: "testuser3",
            email: "testuser3@example.com",
            password: "testpassword",
            role: "Regular",
        });
        group = await Group.create({
            name: "Group Test",
            members: [
                {
                    email: admin.email,
                    user: admin.id,
                },
                {
                    email: user.email,
                    user: user.id,
                },
            ],
        });
        const emailsToRemove = [user2.email];

        const response = await request(app)
            .patch(`/api/groups/${group.name}/pull/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ emails: emailsToRemove });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "all the provided emails do not belong to the group or do not exist in the database"
        );
    });

    test("should return a 400 error if all provided emails do not exist in the database", async () => {
        group = await Group.create({
            name: "Group Test",
            members: [
                {
                    email: user.email,
                    user: user.id,
                },
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });
        const emailsToRemove = [
            "nonexistent1@example.com",
            "nonexistent2@example.com",
        ];

        const response = await request(app)
            .patch(`/api/groups/${group.name}/pull/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ emails: emailsToRemove });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "all the provided emails do not belong to the group or do not exist in the database"
        );
    });

    test("should return error if at least one of the member emails is not in a valid email format", async () => {
        const emailsToRemove = ["invalidemail", user.email];

        const response = await request(app)
            .patch(`/api/groups/${group.name}/pull/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ emails: emailsToRemove });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid request body");
    });

    test("should return error if at least one of the member emails is an empty string", async () => {
        const emailsToRemove = ["", user.email];

        const response = await request(app)
            .patch(`/api/groups/${group.name}/pull/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ emails: emailsToRemove });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid request body");
    });

    test("should return error if the group contains only one member before deleting any user", async () => {
        group = await Group.create({
            name: "Group Test",
            members: [
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });
        const emailsToRemove = [admin.email];

        // Remove the second member to make the group contain only one member

        const response = await request(app)
            .patch(`/api/groups/${group.name}/pull/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ emails: emailsToRemove });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("the group contains only one member");
    });

    test("should return a 401 error if called by an authenticated user who is not part of the group and not admin", async () => {
        group = await Group.create({
            name: "Group Test",
            members: [
                {
                    email: user.email,
                    user: user.id,
                },
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });
        const newUser = await User.create({
            username: "anotheruser",
            email: "another@example.com",
            password: "0",
        });
        const token = jwt.sign(
            {
                email: newUser.email,
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
            },
            process.env.ACCESS_KEY,
            { expiresIn: "1h" }
        );

        const response = await request(app)
            .patch(`/api/groups/${group.name}/remove/`)
            .set("Cookie", `accessToken=${token};refreshToken=${token}`)
            .send({ emails: [user.email] });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Unauthorized");
    });

    test("should return a 401 error if called by an authenticated user who is not an admin", async () => {
        group = await Group.create({
            name: "Group Test",
            members: [
                {
                    email: user.email,
                    user: user.id,
                },
                {
                    email: admin.email,
                    user: admin.id,
                },
            ],
        });
        const newUser = await User.create({
            username: "anotheruser",
            email: "another@example.com",
            password: "0",
        });
        const token = jwt.sign(
            {
                email: newUser.email,
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
            },
            process.env.ACCESS_KEY,
            { expiresIn: "1h" }
        );

        const response = await request(app)
            .patch(`/api/groups/${group.name}/pull/`)
            .set("Cookie", `accessToken=${token};refreshToken=${token}`)
            .send({ emails: [user.email] });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Unauthorized");
    });
});

describe("deleteUser", () => {
    beforeEach(async () => {
        user = await User.create({
            username: "testuser1",
            email: "testuser1@example.com",
            password: "testpassword",
            refreshToken: userToken,
            role: "Regular",
        });
        admin = await User.create({
            username: "admin",
            email: "admin@example.com",
            password: "adminpassword",
            refreshToken: adminTokens,
            role: "Admin",
        });
    });
    afterEach(async () => {
        // Remove the test user after each test case
        await User.deleteMany();
        await Group.deleteMany();
    });
    test("should delete a user and related transactions", async () => {
        Group.create({
            name: "testgroup",
            members: [
                {
                    email: user.email,
                    user: user.id,
                },
            ],
        });

        // Make a request to delete the user
        const response = await request(app)
            .delete("/api/users")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ email: user.email });

        console.log(JSON.stringify(response.body));
        // Assertions
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("deletedTransactions");
        expect(response.body.data).toHaveProperty("deletedFromGroup");

        // Check if the user and related transactions have been deleted from the database
        const deletedUser = await User.findOne({ email: "test@example.com" });
        const deletedTransactions = await transactions.find({
            username: "testuser",
        });
        expect(deletedUser).toBeNull();
        expect(deletedTransactions.length).toBe(0);
    });

    test("should return error if the requester is not an admin", async () => {
        const response = await request(app)
            .delete(`/api/users/`)
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .send({ email: admin.email });

        // Assertion
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    test("should return error if the request body is missing the email", async () => {
        // Make a request to delete a user without providing the email
        const response = await request(app)
            .delete(`/api/users/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            );

        // Assertion
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty(
            "error",
            "Email property missing in the request body"
        );
    });

    test("should return error if the email in the request body is empty", async () => {
        // Make a request to delete a user with an empty email
        const response = await request(app)
            .delete(`/api/users/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ email: "" });

        // Assertion
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Email cannot be empty");
    });

    test("should return error if the email in the request body is in the wrong format", async () => {
        // Make a request to delete a user with an invalid email format
        const response = await request(app)
            .delete(`/api/users/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ email: "wrongEmailFormat" });

        // Assertion
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Wrong email format");
    });

    test("should return error if the provided email does not exist in the database", async () => {
        // Make a request to delete a non-existent user
        const response = await request(app)
            .delete(`/api/users/`)
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .send({ email: "nonExistantEmail@example.com" });

        // Assertion
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty(
            "error",
            "The provided email is not associated to any account"
        );
    });
});

// admin exclusive on the route: delete request to /api/groups/
describe("deleteGroup", () => {
    beforeEach(async () => {
        let user = await User.create({
            username: "testuser1",
            email: "testuser1@example.com",
            password: "testpassword",
            refreshToken: userToken,
            role: "Regular",
        });
        await Group.create({
            name: "group1",
            members: [
                {
                    email: user.email,
                    user: user._id,
                },
            ],
        });
    });
    afterEach(async () => {
        // Remove the test user after each test case
        await User.deleteMany();
        await Group.deleteMany();
    });
    test("should delete the group and return success message", async () => {
        try {
            const response = await request(app)
                .delete("/api/groups")
                .send({ name: "group1" })
                .set(
                    "Cookie",
                    `accessToken=${adminTokens};refreshToken=${adminTokens}`
                );

            // Assertions
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toBe({
                message: "Group deleted successfully",
            });

            // Check if the user and related transactions have been deleted from the database
            const deletedGroup = await Group.findOne({
                name: "group1",
            });

            expect(deletedGroup).toBeNull();
        } catch (error) {}
    });
    test("Exception case, user call", async () => {
        try {
            const response = await request(app)
                .delete("/api/groups")
                .send({ name: "group1" })
                .set(
                    "Cookie",
                    `accessToken=${userToken};refreshToken=${userToken}`
                );

            // Assertions
            expect(response.status).toBe(401);
        } catch (error) {}
    });
    test("Excpetion case, empty body", async () => {
        try {
            const response = await request(app)
                .delete("/api/groups")
                .send({})
                .set(
                    "Cookie",
                    `accessToken=${adminTokens};refreshToken=${adminTokens}`
                );

            // Assertions
            expect(response.status).toBe(400);
            expect(response.body).toBe({
                error: " name property missing in the request body",
            });
        } catch (error) {}
    });
    test("Excpetion case, empty string", async () => {
        try {
            const response = await request(app)
                .delete("/api/groups")
                .send({
                    name: "",
                })
                .set(
                    "Cookie",
                    `accessToken=${adminTokens};refreshToken=${adminTokens}`
                );

            // Assertions
            expect(response.status).toBe(400);
            expect(response.body).toBe({
                error: "name cannot be empty",
            });
        } catch (error) {}
    });
    test("should return error if the group does not exist", async () => {
        try {
            const response = await request(app)
                .delete("/api/groups")
                .send({
                    name: "group2",
                })
                .set(
                    "Cookie",
                    `accessToken=${adminTokens};refreshToken=${adminTokens}`
                );

            // Assertions
            expect(response.status).toBe(400);
            expect(response.body).toBe({
                error: "The provided group does not exist",
            });
        } catch (error) {}
    });
});
