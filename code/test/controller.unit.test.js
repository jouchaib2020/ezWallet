import request from "supertest";
import { app } from "../app";
import { categories, transactions } from "../models/model";
import { Group, User, UserSchema } from "../models/User";
import {
    getCategories,
    updateCategory,
    createCategory,
    deleteCategory,
    getAllTransactions,
    getTransactionsByUser,
    getTransactionsByUserByCategory,
    deleteTransactions,
    deleteTransaction,
    createTransaction,
    getTransactionsByGroup,
    getTransactionsByGroupByCategory,
} from "../controllers/controller";
import { verifyAuth } from "../controllers/utils";

jest.mock("../models/model.js");
jest.mock("../models/User.js");
jest.mock("../controllers/utils.js");

beforeEach(() => {
    categories.find.mockClear();
    categories.prototype.save.mockClear();
    transactions.find.mockClear();
    transactions.deleteOne.mockClear();
    transactions.aggregate.mockClear();
    transactions.prototype.save.mockClear();
    verifyAuth.mockClear();
});

describe("createCategory", () => {
    test("nominal case", async () => {
        const mockReq = {
            body: {
                type: "love",
                color: "#FF00FF",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            locals: {
                refreshedTokenMessage: "expired token",
            },
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => false);
        categories.prototype.save.mockImplementation(() => ({
            type: "love",
            color: "#FF00FF",
        }));

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                type: "love",
                color: "#FF00FF",
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("property not provided", async () => {
        const mockReq = {
            body: {
                type: "drink",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });
    test("empty property", async () => {
        const mockReq = {
            body: {
                type: "drink",
                color: "",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });
    test("already present category", async () => {
        const mockReq = {
            body: {
                type: "drink",
                color: "red",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        await createCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });
});

describe("updateCategory", () => {
    test("update category", async () => {
        const mockReq = {
            params: {
                type: "sport",
            },
            body: {
                type: "drink",
                color: "#FF00FF",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            locals: {
                refreshedTokenMessage: "expired token",
            },
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(categories, "findOne")
            .mockImplementation(() => false)
            .mockReturnValueOnce(true);

        jest.spyOn(categories, "countDocuments").mockImplementation(
            () => mockedCateogories.length
        );

        jest.spyOn(categories, "updateOne").mockImplementation(() => {});

        jest.spyOn(transactions, "updateMany").mockImplementation(() => ({
            modifiedCount: 10,
        }));

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: {
                message: "Category edited successfully",
                count: 10,
            },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("type or color missing", async () => {
        const mockReq = {
            params: {
                type: "sport",
            },
            body: {
                color: "#FF00FF",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            locals: {
                refreshedTokenMessage: "expired token",
            },
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Type or color not provided in request body",
        });
    });
    test("type or color empty", async () => {
        const mockReq = {
            params: {
                type: "sport",
            },
            body: {
                type: "sport",
                color: "",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            locals: {
                refreshedTokenMessage: "expired token",
            },
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Type or color cannot be empty",
        });
    });
    test("old category does not exist", async () => {
        const mockReq = {
            params: {
                type: "sport",
            },
            body: {
                type: "drink",
                color: "#FF00FF",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            locals: {
                refreshedTokenMessage: "expired token",
            },
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => false);

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "The category does not exist",
        });
    });
    test("new category exists already", async () => {
        const mockReq = {
            params: {
                type: "sport",
            },
            body: {
                type: "drink",
                color: "#FF00FF",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            locals: {
                refreshedTokenMessage: "expired token",
            },
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        await updateCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "new category is already in the database",
        });
    });
});

describe("deleteCategory", () => {
    test("normal case", async () => {
        const mockReq = {
            body: { types: ["sport"] },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "token",
            },
        };

        jest.spyOn(categories, "countDocuments").mockImplementation(() => 10);

        jest.spyOn(categories, "findOne").mockResolvedValue(true);

        jest.spyOn(categories, "aggregate").mockResolvedValue([
            {
                type: "sport",
            },
        ]);

        jest.spyOn(categories, "deleteOne").mockImplementation(() => ({
            deletedCount: 1,
        }));

        jest.spyOn(transactions, "updateMany").mockImplementation((p, b) => ({
            modifiedCount: 10,
        }));

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    test("normal case, delete all categories", async () => {
        const mockReq = {
            body: { types: ["sport", "food"] },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "token",
            },
        };

        jest.spyOn(categories, "countDocuments").mockImplementation(() => 2);

        jest.spyOn(categories, "findOne").mockResolvedValue(true);

        jest.spyOn(categories, "aggregate").mockResolvedValue([
            {
                type: "sport",
            },
        ]);

        jest.spyOn(categories, "deleteOne").mockImplementation(() => ({
            deletedCount: 1,
        }));

        jest.spyOn(transactions, "updateMany").mockImplementation((p, b) => ({
            modifiedCount: 10,
        }));

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    test("unauthorized", async () => {
        const mockReq = {
            body: { types: ["sport"] },
        };

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "token",
            },
        };

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test("not passing types", async () => {
        const mockReq = {
            body: {},
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Body does not have types property",
        });
    });
    test("one category in db", async () => {
        const mockReq = {
            body: {
                types: ["Sport"],
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "countDocuments").mockImplementation(() => 1);

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Cannot delete, only one category is present",
        });
    });
    test("empty category passed", async () => {
        const mockReq = {
            body: {
                types: [""],
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "countDocuments").mockImplementation(() => 10);

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Category cannot be an empty string",
        });
    });
    test("category to delete not found", async () => {
        const mockReq = {
            body: {
                types: ["sport"],
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "countDocuments").mockImplementation(() => 10);
        jest.spyOn(categories, "findOne").mockImplementation(() => false);

        await deleteCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "The sport category does not exist",
        });
    });
});

describe("getCategories", () => {
    test("No categories", async () => {
        const mockReq = {};

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "find").mockImplementation(() => []);
        await getCategories(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: [],
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("Unauthorized", async () => {
        const mockReq = {};

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        await getCategories(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test("Various categories", async () => {
        const mockReq = {};

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        const mockedCateogories = [
            { type: "sport", color: "#FFFFFF" },
            { type: "food", color: "#FF0000" },
        ];

        jest.spyOn(categories, "find").mockImplementation(
            () => mockedCateogories
        );
        await getCategories(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: mockedCateogories,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
});

describe("createTransaction", () => {
    test("nominal case", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                username: "Peppe",
                type: "drink",
                amount: 20,
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    test("exception case, anauthorized", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                username: "Peppe",
                type: "drink",
                amount: 20,
            },
        };

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test("exception case, missing info in the body", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                type: "drink",
                amount: 20,
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Body does not have all the properties",
        });
    });
    test("exception case, empty strings in the body", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                username: "",
                type: "drink",
                amount: 20,
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Body properties must be non empty",
        });
    });
    test("exception case, modifying another users transactions", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                username: "Mario",
                type: "drink",
                amount: 20,
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Cannot create a transaction for another user",
        });
    });
    test("exception case, username does not exist", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                username: "Peppe",
                type: "drink",
                amount: 20,
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        jest.spyOn(User, "findOne").mockImplementation(() => false);

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });
    test("exception case, category does not exist", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                username: "Peppe",
                type: "drinfsk",
                amount: 20,
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => false);

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });
    test("exception case, amount is not parsable", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                username: "Peppe",
                type: "drinfsk",
                amount: "rb3",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        await createTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: `Amount cannot be converted to a float`,
        });
    });
});

describe("getAllTransactions", () => {
    test("nominal case", async () => {
        const mockReq = {};

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        const mockedResult = [
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
        ];

        const result = [
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
        ];

        jest.spyOn(transactions, "aggregate").mockImplementation(
            () => mockedResult
        );

        await getAllTransactions(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: result,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("exception case, anauthorized", async () => {
        const mockReq = {};

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        await getAllTransactions(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
});

describe("getTransactionsByUser", () => {
    test("nominal case, admin call", async () => {
        const mockReq = {
            params: {
                username: "user1",
            },
            url: "/api/transactions/users/user1",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        const resultAggregate = [
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
        ];

        const result = [
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
        ];

        jest.spyOn(transactions, "aggregate").mockImplementation(
            () => resultAggregate
        );

        await getTransactionsByUser(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: result,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("exception case, user call on admin path", async () => {
        const mockReq = {
            params: {
                username: "user1",
            },
            url: "/api/transactions/users/user1",
        };

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        await getTransactionsByUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test("exception case, admin call username does not exist", async () => {
        const mockReq = {
            params: {
                username: "user3",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockImplementation(() => false);

        await getTransactionsByUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "user not found" });
    });
    test("nominal case, user call", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            url: "/api/users/Peppe/transactions",
            query: {},
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        const resultAggregate = [
            {
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
        ];

        const result = [
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
        ];

        jest.spyOn(transactions, "aggregate").mockImplementation(
            () => resultAggregate
        );

        await getTransactionsByUser(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: result,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    test("exception case, user call for another user", async () => {
        const mockReq = {
            params: {
                username: "Manuel",
            },
            url: "/api/users/Peppe/transactions",
        };

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        await getTransactionsByUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test("exception case, user call username does not exist", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockImplementation(() => false);

        await getTransactionsByUser(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "user not found" });
    });
});

// admin call --> /api/transactions/users/Mario/category/food
// user call --> /api/users/Mario/transactions/category/food

describe("getTransactionsByUserByCategory", () => {
    test("nominal case, admin call", async () => {
        const mockReq = {
            params: {
                username: "user1",
                category: "sport",
            },
            url: "/api/transactions/users/user1/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        const aggregResult = [
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
        ];

        const result = [
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
        ];

        jest.spyOn(transactions, "aggregate").mockImplementation(
            () => aggregResult
        );

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: result,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("exception case, user call on admin path", async () => {
        const mockReq = {
            params: {
                username: "user1",
                category: "sport",
            },
            url: "/api/transactions/users/user1/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Unauthorized usage of exclusive path /transaction/users/user/categories/category use /users/:username/transactions instead",
        });
    });
    test("exception case, admin call username doen't exist", async () => {
        const mockReq = {
            params: {
                username: "user1",
                category: "sport",
            },
            url: "/api/transactions/users/user1/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockImplementation(() => false);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "user not found" });
    });
    test("exception case, admin call category does not exist", async () => {
        const mockReq = {
            params: {
                username: "user1",
                category: "sport",
            },
            url: "/api/transactions/users/user1/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        jest.spyOn(categories, "findOne").mockImplementation(() => false);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "category not found",
        });
    });
    test("nominal case, user call", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
                category: "sport",
            },
            url: "/api/users/Peppe/transactions/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => ({
            username: "Peppe",
        }));

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        const aggregResult = [
            {
                _id: 0,
                username: "Peppe",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
            {
                _id: 0,
                username: "Peppe",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
            {
                _id: 0,
                username: "Peppe",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
        ];

        const result = [
            {
                username: "Peppe",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
            {
                username: "Peppe",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
            {
                username: "Peppe",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
        ];

        jest.spyOn(transactions, "aggregate").mockImplementation(
            () => aggregResult
        );

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: result,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("exeption case, user call for another user", async () => {
        const mockReq = {
            params: {
                username: "Manuel",
                category: "sport",
            },
            url: "/api/users/Manuel/transactions/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => ({
            username: "Peppe",
        }));

        jest.spyOn(categories, "findOne").mockImplementation(() => true);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
    test("exception case, user call username doen't exist", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
                category: "sport",
            },
            url: "/api/users/Peppe/transactions/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockImplementation(() => false);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "user not found" });
    });
    test("exception case, user call category does not exist", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
                category: "sport",
            },
            url: "/api/users/Peppe/transactions/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        jest.spyOn(categories, "findOne").mockImplementation(() => false);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "category not found",
        });
    });
});

describe("getTransactionsByGroup", () => {
    test("nominal case, admin call", async () => {
        const mockReq = {
            params: {
                name: "group1",
            },
            url: "/api/transactions/groups/group1",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(Group, "findOne").mockResolvedValueOnce({
            members: [{ email: "email.com" }],
        });

        jest.spyOn(User, "findOne").mockImplementation(() => ({
            username: "user1",
        }));

        const resultAggregate = [
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
        ];

        const result = [
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
        ];

        jest.spyOn(transactions, "aggregate").mockImplementation(
            () => resultAggregate
        );

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: result,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("exception case, user call on admin path", async () => {
        const mockReq = {
            params: {
                name: "group1",
            },
            url: "/api/transactions/groups/group1",
        };

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(Group, "findOne").mockResolvedValueOnce({
            members: [{ email: "email.com" }],
        });

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Admin exclusive route",
        });
    });
    test("admin call, group does not exists", async () => {
        const mockReq = {
            params: {
                name: "group1",
            },
            url: "/api/transactions/groups/group1",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(Group, "findOne").mockResolvedValueOnce(false);

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Group not found" });
    });
    test("nominal case, user call", async () => {
        const mockReq = {
            params: {
                name: "group1",
            },
            url: "/api/groups/group1/transactions",
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        verifyAuth.mockReturnValueOnce({ authorized: true });

        jest.spyOn(Group, "findOne").mockResolvedValueOnce({
            members: [{ email: "email.com" }],
        });

        jest.spyOn(User, "findOne").mockImplementation(() => ({
            username: "user1",
        }));

        const resultAggregate = [
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
        ];

        const result = [
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
        ];

        jest.spyOn(transactions, "aggregate").mockImplementation(
            () => resultAggregate
        );

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: result,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("user call, member not in group", async () => {
        const mockReq = {
            params: {
                name: "group1",
            },
            url: "/api/groups/group1/transactions",
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        verifyAuth.mockReturnValueOnce({ authorized: false });

        jest.spyOn(Group, "findOne").mockResolvedValueOnce({
            members: [{ email: "email.com" }],
        });

        await getTransactionsByGroup(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
});

describe("getTransactionsByGroupByCategory", () => {
    test("nominal case, admin call", async () => {
        const mockReq = {
            params: {
                name: "group1",
                category: "sport",
            },
            url: "/api/transactions/groups/group1/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(Group, "findOne").mockResolvedValueOnce({
            members: [{ email: "email.com" }],
        });

        jest.spyOn(categories, "findOne").mockResolvedValue(true);

        jest.spyOn(User, "findOne").mockImplementation(() => ({
            username: "user1",
        }));

        const resultAggregate = [
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
        ];

        const result = [
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
        ];

        jest.spyOn(transactions, "aggregate").mockImplementation(
            () => resultAggregate
        );

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: result,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("exception case, user call on admin path", async () => {
        const mockReq = {
            params: {
                name: "group1",
                category: "sport",
            },
            url: "/api/transactions/groups/group1/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(Group, "findOne").mockResolvedValueOnce({
            members: [{ email: "email.com" }],
        });

        jest.spyOn(categories, "findOne").mockResolvedValue(true);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Admin exclusive route",
        });
    });
    test("exception case, admin call group does not exist", async () => {
        const mockReq = {
            params: {
                name: "group1",
                category: "sport",
            },
            url: "/api/transactions/groups/group1/category/sport",
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(Group, "findOne").mockResolvedValueOnce(false);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "Group not found" });
    });
    test("exception case, admin call category does not exist", async () => {
        const mockReq = {
            params: {
                name: "group1",
                category: "sport",
            },
            url: "/api/transactions/groups/group1/category/sport",
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        verifyAuth.mockReturnValueOnce({ authorized: true });

        jest.spyOn(Group, "findOne").mockResolvedValueOnce({
            members: [{ email: "email.com" }],
        });

        jest.spyOn(categories, "findOne").mockResolvedValue(false);

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Cateogory not found",
        });
    });
    test("nominal case, user call", async () => {
        const mockReq = {
            params: {
                name: "group1",
                category: "sport",
            },
            url: "/api/groups/group1/transactions/category/sport",
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        verifyAuth.mockReturnValueOnce({ authorized: true });

        jest.spyOn(Group, "findOne").mockResolvedValueOnce({
            members: [{ email: "email.com" }],
        });

        jest.spyOn(categories, "findOne").mockResolvedValue(true);

        jest.spyOn(User, "findOne").mockImplementation(() => ({
            username: "user1",
        }));

        const resultAggregate = [
            {
                _id: 0,
                username: "user1",
                amount: 10,
                type: "sport",
                categoriesInfo: {
                    type: "sport",
                    color: "#FF00FF",
                },
                date: "YYYY-MM-DD",
            },
        ];

        const result = [
            {
                username: "user1",
                amount: 10,
                type: "sport",
                color: "#FF00FF",
                date: "YYYY-MM-DD",
            },
        ];

        jest.spyOn(transactions, "aggregate").mockImplementation(
            () => resultAggregate
        );

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
            data: result,
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
});

describe("deleteTransaction", () => {
    test("user call,", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                _id: "1",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => ({
            username: "Peppe",
        }));

        jest.spyOn(transactions, "findOne").mockImplementation(() => ({
            username: "Peppe",
        }));

        jest.spyOn(transactions, "deleteOne").mockImplementation(() => {});

        await deleteTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: { message: "Transaction deleted" },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("user call, transaction does not exist", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {
                _id: "5",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        jest.spyOn(transactions, "findOne").mockImplementation(() => false);

        jest.spyOn(transactions, "deleteOne").mockImplementation(() => {});

        await deleteTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Transaction does not exist",
        });
    });
    test("user call, id not provided", async () => {
        const mockReq = {
            params: {
                username: "Peppe",
            },
            body: {},
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        await deleteTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Body does not have _id property",
        });
    });
    test("user call, wrong username in params", async () => {
        const mockReq = {
            params: {
                username: "Gino",
            },
            body: { _id: 5 },
        };

        verifyAuth.mockReturnValue({ authorized: false });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(User, "findOne").mockImplementation(() => true);

        jest.spyOn(transactions, "findOne").mockImplementation(() => true);

        jest.spyOn(transactions, "deleteOne").mockImplementation(() => {});

        await deleteTransaction(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
});

describe("deleteTransactions", () => {
    test("all ids exist", async () => {
        const mockReq = {
            body: {
                _ids: ["1", "2", "3"],
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(transactions, "findOne").mockImplementation(() => true);

        jest.spyOn(transactions, "find").mockImplementation(() => [1, 2, 3]);

        jest.spyOn(transactions, "deleteMany").mockImplementation(() => {});

        await deleteTransactions(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            data: { message: "Transactions deleted" },
            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage,
        });
    });
    test("one id does not exist", async () => {
        const mockReq = {
            body: {
                _ids: ["1", "2", "3", "5"],
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "expired token",
            },
        };

        jest.spyOn(transactions, "findOne").mockImplementation(() => [1, 2, 3]);

        await deleteTransactions(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "One or more ids not found",
        });
    });
});
