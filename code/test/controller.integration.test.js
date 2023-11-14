import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import { Group, User } from "../models/User";
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import { response } from "express";

dotenv.config();

const adminTokens =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU5NjU5MDQsImV4cCI6MTcxNzUwMjMzNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluIiwicm9sZSI6IkFkbWluIn0.F8XD5vrNWhHQO6kJK-uzjJs32M5S30WZDE5SVylet7w";

const userToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2ODU5NjU5MDQsImV4cCI6MTcxNzUwODI4MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiUGVwcGUiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwicm9sZSI6IlJlZ3VsYXIifQ.ZkTtb3GkDPHI5rk777v-neon0E9cO5CFSe8mh8I-A6g";

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

describe("createCategory", () => {
    beforeAll(async () => {
        await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
    });
    test("Nominal case", (done) => {
        // need to call create category function
        request(app)
            .post("/api/categories")
            .send({
                type: "food",
                color: "#FFFFFF",
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: {
                        type: "food",
                        color: "#FFFFFF",
                    },
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, user call", (done) => {
        // need to call create category function
        request(app)
            .post("/api/categories")
            .send({
                type: "food",
                color: "#FFFFFF",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, no type or body", (done) => {
        // need to call create category function
        request(app)
            .post("/api/categories")
            .send({
                color: "#FFFFFF",
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Type or color not provided in request body",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, empty type or body", (done) => {
        // need to call create category function
        request(app)
            .post("/api/categories")
            .send({
                type: "",
                color: "#FFFFFF",
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Type or color cannot be empty",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, category already present in db", (done) => {
        // need to call create category function
        request(app)
            .post("/api/categories")
            .send({
                type: "sport",
                color: "#FFFFFF",
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Category already present",
                });
                done();
            })
            .catch((err) => done(err));
    });
    afterAll(async () => {
        await categories.deleteMany();
        await User.deleteMany();
    });
});

describe("updateCategory", () => {
    const myDate = new Date();
    beforeEach(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
        await categories.create({
            type: "food",
            color: "#FFFF00",
        });

        await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await User.create({
            username: "Manuel",
            email: "test2@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });
        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
        await transactions.create({
            username: "Manuel",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
    });
    test("Nominal case, admin call", (done) => {
        // need to call create category function
        request(app)
            .patch("/api/categories/sport")
            .send({
                type: "travel",
                color: "#00FF00",
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: {
                        message: "Category edited successfully",
                        count: 1,
                    },
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, user call", (done) => {
        // need to call create category function
        request(app)
            .patch("/api/categories/sport")
            .send({
                type: "travel",
                color: "#00FF00",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, old category does not exist", (done) => {
        // need to call create category function
        request(app)
            .patch("/api/categories/travel")
            .send({
                type: "travel",
                color: "#00FF00",
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "The category does not exist",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, body has missing info", (done) => {
        // need to call create category function
        request(app)
            .patch("/api/categories/sport")
            .send({
                color: "#00FF00",
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Type or color not provided in request body",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, body has empty info", (done) => {
        // need to call create category function
        request(app)
            .patch("/api/categories/sport")
            .send({
                type: "",
                color: "#00FF00",
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Type or color cannot be empty",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, new category already in db", (done) => {
        // need to call create category function
        request(app)
            .patch("/api/categories/sport")
            .send({
                type: "food",
                color: "#00FF00",
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "new category is already in the database",
                });
                done();
            })
            .catch((err) => done(err));
    });
    afterEach(async () => {
        await categories.deleteMany();
        await User.deleteMany();
        await transactions.deleteMany();
    });
});

describe("deleteCategory", () => {
    const myDate = new Date();
    beforeEach(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
        await categories.create({
            type: "food",
            color: "#FFFF00",
        });

        await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await User.create({
            username: "Manuel",
            email: "test2@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });
        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
        await transactions.create({
            username: "Manuel",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
    });
    test("Nominal case, admin call", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/categories")
            .send({
                types: ["sport"],
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: { message: "Categories deleted", count: 1 },
                });
                done();
            })
            .catch((err) => done(err));
    });

    test("Exception case, user call", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/categories")
            .send({
                types: ["sport"],
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });

    test("Exception case, only one category in db call", (done) => {
        // need to call create category function
        categories.deleteOne({ type: "sport" }).then(() => {
            request(app)
                .delete("/api/categories")
                .send({
                    types: ["sport"],
                })
                .set(
                    "Cookie",
                    `accessToken=${adminTokens};refreshToken=${adminTokens}`
                )
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body).toStrictEqual({
                        error: "Cannot delete, only one category is present",
                    });
                    done();
                })
                .catch((err) => done(err));
        });
    });

    test("Nominal case, admin call deleting all categories", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/categories")
            .send({
                types: ["sport", "food"],
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.body).toStrictEqual({
                    data: { message: "Categories deleted", count: 2 },
                });
                expect(response.status).toBe(200);
                done();
            })
            .catch((err) => done(err));
    });

    test("Exception case, types not passed", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/categories")
            .send({})
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Body does not have types property",
                });
                done();
            })
            .catch((err) => done(err));
    });

    test("Exception case, one type is empty", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/categories")
            .send({
                types: ["", "food"],
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Category cannot be an empty string",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, one type is not in db", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/categories")
            .send({
                types: ["banana", "food"],
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: `The banana category does not exist`,
                });
                done();
            })
            .catch((err) => done(err));
    });
    afterEach(async () => {
        await categories.deleteMany();
        await User.deleteMany();
        await transactions.deleteMany();
    });
});

describe("getCategories", () => {
    beforeAll(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
        await categories.create({
            type: "food",
            color: "#FFFF00",
        });
    });
    test("Nominal case", (done) => {
        // need to call create category function
        request(app)
            .get("/api/categories")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toEqual({
                    data: [
                        {
                            type: "sport",
                            color: "#FFFFFF",
                        },
                        {
                            type: "food",
                            color: "#FFFF00",
                        },
                    ],
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, not authorized", (done) => {
        // need to call create category function
        request(app)
            .get("/api/categories")
            .set("Cookie", `accessToken=${adminTokens};refreshToken=`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });
    afterAll(async () => {
        await categories.deleteMany();
    });
});

describe("createTransaction", () => {
    beforeAll(async () => {
        await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
        await categories.create({
            type: "food",
            color: "#FFFF00",
        });
    });
    test("Nominal case", (done) => {
        // need to call create category function
        request(app)
            .post("/api/users/Peppe/transactions")
            .send({
                username: "Peppe",
                amount: 12.45,
                type: "sport",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(200);
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, parameter missing", (done) => {
        // need to call create category function
        request(app)
            .post("/api/users/Peppe/transactions")
            .send({
                amount: 12.45,
                type: "sport",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Body does not have all the properties",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, parameter empty", (done) => {
        // need to call create category function
        request(app)
            .post("/api/users/Peppe/transactions")
            .send({
                username: "",
                amount: 12.45,
                type: "sport",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Body properties must be non empty",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, category not in db", (done) => {
        // need to call create category function
        request(app)
            .post("/api/users/Peppe/transactions")
            .send({
                username: "Peppe",
                amount: 12.45,
                type: "drinks",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: `The provided type(drinks) is not an existing category`,
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, user in body is different than the one in params", (done) => {
        // need to call create category function
        request(app)
            .post("/api/users/Peppe/transactions")
            .send({
                username: "Mario",
                amount: 12.45,
                type: "sport",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: `Cannot create a transaction for another user`,
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, user in params does not exist", (done) => {
        // need to call create category function
        request(app)
            .post("/api/users/Mario/transactions")
            .send({
                username: "Mario",
                amount: 12.45,
                type: "sport",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, amount is not parsable", (done) => {
        // need to call create category function
        request(app)
            .post("/api/users/Peppe/transactions")
            .send({
                username: "Peppe",
                amount: "fg5",
                type: "sport",
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: `Amount cannot be converted to a float`,
                });
                done();
            })
            .catch((err) => done(err));
    });
    afterAll(async () => {
        await categories.deleteMany();
        await transactions.deleteMany();
        await User.deleteMany();
    });
});

describe("getAllTransactions", () => {
    beforeAll(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
        await categories.create({
            type: "food",
            color: "#FFFF00",
        });

        await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
        });
        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
        });
        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "food",
        });
    });
    test("Nominal case", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception casem not an admin", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });
    afterAll(async () => {
        await categories.deleteMany();
        await User.deleteMany();
        await transactions.deleteMany();
    });
});

describe("getTransactionsByUser", () => {
    const myDate = new Date();
    beforeAll(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
        await categories.create({
            type: "food",
            color: "#FFFF00",
        });

        await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await User.create({
            username: "Manuel",
            email: "test2@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });
        await transactions.create({
            username: "Peppe",
            amount: 30,
            type: "sport",
            date: myDate,
        });
        await transactions.create({
            username: "Manuel",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
    });
    test("Nominal case, admin call", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/users/Peppe")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, admin call, user in params does not exist", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/users/Giulio")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "user not found",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, user call on admin path", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/users/Peppe")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error:
                        "Unauthorized usage of exclusive path /transaction/users/user use api/users/" +
                        "Peppe" +
                        "/transactions instead",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Nominal case, user call", (done) => {
        // need to call create category function
        request(app)
            .get("/api/users/Peppe/transactions")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(200);
                done();
            })
            .catch((err) => done(err));
    });
    test("Nominal case, user call with filters", (done) => {
        // need to call create category function
        request(app)
            .get("/api/users/Peppe/transactions?min=10&max=20")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: [
                        {
                            username: "Peppe",
                            amount: 12.54,
                            type: "sport",
                            color: "#FFFFFF",
                            date: myDate.toISOString(),
                        },
                    ],
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, user call for another users transactions", (done) => {
        // need to call create category function
        request(app)
            .get("/api/users/Manuel/transactions")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });
    afterAll(async () => {
        await categories.deleteMany();
        await User.deleteMany();
        await transactions.deleteMany();
    });
});

describe("getTransactionsByUserByCategory", () => {
    const myDate = new Date();
    beforeAll(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
        await categories.create({
            type: "food",
            color: "#FFFF00",
        });

        await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await User.create({
            username: "Manuel",
            email: "test2@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });
        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
        await transactions.create({
            username: "Manuel",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
    });
    test("Nominal case, admin call", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/users/Peppe/category/sport")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, admin call, user in params does not exist", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/users/Giulio/category/sport")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "user not found",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, admin call, cateogory in params does not exist", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/users/Peppe/category/travel")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "category not found",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Error case, user call on admin path", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/users/Peppe/category/sport")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "Unauthorized usage of exclusive path /transaction/users/user/categories/category use /users/:username/transactions instead",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Nominal case, user call", (done) => {
        // need to call create category function
        request(app)
            .get("/api/users/Peppe/transactions/category/sport")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: [
                        {
                            username: "Peppe",
                            amount: 12.54,
                            type: "sport",
                            color: "#FFFFFF",
                            date: myDate.toISOString(),
                        },
                    ],
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Eception case, user call for another users transactions", (done) => {
        // need to call create category function
        request(app)
            .get("/api/users/Manuel/transactions/category/sport")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });
    afterAll(async () => {
        await categories.deleteMany();
        await User.deleteMany();
        await transactions.deleteMany();
    });
});

describe("getTransactionsByGroup", () => {
    const myDate = new Date();
    var peppeUser, manuelUser;
    beforeAll(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });

        peppeUser = await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        manuelUser = await User.create({
            username: "Manuel",
            email: "test2@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await Group.create({
            name: "group1",
            members: [
                {
                    email: peppeUser.email,
                    user: peppeUser._id,
                },
            ],
        });

        await Group.create({
            name: "group3",
            members: [
                {
                    email: manuelUser.email,
                    user: manuelUser._id,
                },
            ],
        });

        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });
        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });
        await transactions.create({
            username: "Manuel",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });
    });
    test("Nominal case, admin call", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/groups/group1")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: [
                        {
                            username: "Peppe",
                            amount: 12.54,
                            type: "sport",
                            date: myDate.toISOString(),
                            color: "#FFFFFF",
                        },
                        {
                            username: "Peppe",
                            amount: 12.54,
                            type: "sport",
                            date: myDate.toISOString(),
                            color: "#FFFFFF",
                        },
                    ],
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, admin call group does not exist", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/groups/group2")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Group not found",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Nominal case, user call", (done) => {
        // need to call create category function
        request(app)
            .get("/api/groups/group1/transactions")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: [
                        {
                            username: "Peppe",
                            amount: 12.54,
                            type: "sport",
                            date: myDate.toISOString(),
                            color: "#FFFFFF",
                        },
                        {
                            username: "Peppe",
                            amount: 12.54,
                            type: "sport",
                            date: myDate.toISOString(),
                            color: "#FFFFFF",
                        },
                    ],
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, user calls on admin path", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/groups/group1")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "Admin exclusive route",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, user not in group", (done) => {
        // need to call create category function
        request(app)
            .get("/api/groups/group3/transactions")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "Requesting user not in group",
                });
                done();
            })
            .catch((err) => done(err));
    });
    afterAll(async () => {
        await categories.deleteMany();
        await Group.deleteMany();
        await User.deleteMany();
        await transactions.deleteMany();
    });
});

describe("getTransactionsByGroupByCategory", () => {
    const myDate = new Date();
    var peppeUser, manuelUser;
    beforeAll(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });

        await categories.create({
            type: "travel",
            color: "#FF00FF",
        });

        peppeUser = await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        manuelUser = await User.create({
            username: "Manuel",
            email: "test2@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await Group.create({
            name: "group1",
            members: [
                {
                    email: peppeUser.email,
                    user: peppeUser._id,
                },
            ],
        });

        await Group.create({
            name: "group3",
            members: [
                {
                    email: manuelUser.email,
                    user: manuelUser._id,
                },
            ],
        });

        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });
        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "travel",
            date: myDate,
        });
        await transactions.create({
            username: "Manuel",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });
    });
    test("Nominal case, admin call", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/groups/group1/category/sport")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: [
                        {
                            username: "Peppe",
                            amount: 12.54,
                            type: "sport",
                            date: myDate.toISOString(),
                            color: "#FFFFFF",
                        },
                    ],
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Nominal case, admin call no transactions for group and cateogory", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/groups/group3/category/travel")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: [],
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, admin call group does not exist", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/groups/group2")
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Group not found",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Nominal case, user call", (done) => {
        // need to call create category function
        request(app)
            .get("/api/groups/group1/transactions/category/sport")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: [
                        {
                            username: "Peppe",
                            amount: 12.54,
                            type: "sport",
                            date: myDate.toISOString(),
                            color: "#FFFFFF",
                        },
                    ],
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, user call category does not exist", (done) => {
        // need to call create category function
        request(app)
            .get("/api/groups/group1/transactions/category/food")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Cateogory not found",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, user calls on admin path", (done) => {
        // need to call create category function
        request(app)
            .get("/api/transactions/groups/group1/category/sport")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "Admin exclusive route",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, user not in group", (done) => {
        // need to call create category function
        request(app)
            .get("/api/groups/group3/transactions/category/sport")
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "Requesting user not in group",
                });
                done();
            })
            .catch((err) => done(err));
    });
    afterAll(async () => {
        await categories.deleteMany();
        await Group.deleteMany();
        await User.deleteMany();
        await transactions.deleteMany();
    });
});

describe("deleteTransaction", () => {
    const myDate = new Date();
    let transactionPeppe = "";
    let transactionManuel = "";
    beforeEach(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
        await categories.create({
            type: "food",
            color: "#FFFF00",
        });

        await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await User.create({
            username: "Manuel",
            email: "test2@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        transactionPeppe = await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });

        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
        transactionManuel = await transactions.create({
            username: "Manuel",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
    });
    test("Nominal case, admin call", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/users/Peppe/transactions")
            .send({
                _id: transactionPeppe.id,
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: { message: "Transaction deleted" },
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Nominal case, user call", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/users/Peppe/transactions")
            .send({
                _id: transactionPeppe.id,
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: { message: "Transaction deleted" },
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, user call on another users transaction", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/users/Manuel/transactions")
            .send({
                _id: transactionManuel,
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                expect(response.body).toStrictEqual({
                    error: "deleting transaction for user different from the logged one",
                });
                done();
            })
            .catch((err) => done(err));
    });
    afterEach(async () => {
        await categories.deleteMany();
        await User.deleteMany();
        await transactions.deleteMany();
    });
});

describe("deleteTransactions", () => {
    const myDate = new Date();
    let transactionPeppe;
    let transactionManuel;
    let deleted_id;
    beforeEach(async () => {
        await categories.create({
            type: "sport",
            color: "#FFFFFF",
        });
        await categories.create({
            type: "food",
            color: "#FFFF00",
        });

        await User.create({
            username: "Peppe",
            email: "test@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        await User.create({
            username: "Manuel",
            email: "test2@gmail.com",
            password: "password",
            refreshToken: userToken,
            role: "Regular",
        });

        transactionPeppe = await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "sport",
            date: myDate,
        });

        await transactions.create({
            username: "Peppe",
            amount: 12.54,
            type: "food",
            date: myDate,
        });
        transactionManuel = await transactions.create({
            username: "Manuel",
            amount: 12.54,
            type: "food",
            date: myDate,
        });

        deleted_id = (
            await transactions.create({
                username: "Manuel",
                amount: 12.54,
                type: "food",
                date: myDate,
            })
        )._id;

        await transactions.deleteOne({ _id: deleted_id });
    });
    test("Nominal case, admin call", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/transactions")
            .send({
                _ids: [transactionPeppe._id, transactionManuel._id],
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: { message: "Transactions deleted" },
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, not an admin", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/transactions")
            .send({
                _ids: [transactionPeppe._id, transactionManuel._id],
            })
            .set("Cookie", `accessToken=${userToken};refreshToken=${userToken}`)
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, _ids not passed", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/transactions")
            .send({
                //_ids: [transactionPeppe._id, transactionManuel._id],
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "Body does not have _id property",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, one of the _ids is empty ", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/transactions")
            .send({
                _ids: [transactionPeppe._id, transactionManuel._id, ""],
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                    error: "id cannot be an empty string",
                });
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, duplicate id in _ids", (done) => {
        // need to call create category function
        request(app)
            .delete("/api/transactions")
            .send({
                _ids: [
                    transactionPeppe._id,
                    transactionManuel._id,
                    transactionPeppe._id,
                ],
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then(async (response) => {
                expect(response.status).toBe(200);
                expect(response.body).toStrictEqual({
                    data: { message: "Transactions deleted" },
                });
                expect((await transactions.find()).length).toBe(1);
                done();
            })
            .catch((err) => done(err));
    });
    test("Exception case, one id in _ids does not exist", (done) => {
        // will first delete a transaction
        request(app)
            .delete("/api/transactions")
            .send({
                _ids: [transactionPeppe._id, transactionManuel._id, deleted_id],
            })
            .set(
                "Cookie",
                `accessToken=${adminTokens};refreshToken=${adminTokens}`
            )
            .then(async (response) => {
                expect(response.body).toStrictEqual({
                    error: "One or more ids not found",
                });
                expect(response.status).toBe(400);
                // no transactions should be deleted
                expect((await transactions.find()).length).toBe(3);
                done();
            })
            .catch((err) => done(err));
    });
    afterEach(async () => {
        await categories.deleteMany();
        await User.deleteMany();
        await transactions.deleteMany();
    });
});
