import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import {
    handleDateFilterParams,
    handleAmountFilterParams,
    verifyAuth,
} from "./utils.js";

/**
 * Create a new category
- Request Parameters: None
- Request Body Content: An object having attributes `type` and `color`
  - Example: `{type: "food", color: "red"}`
- Response `data` Content: An object having attributes `type` and `color`
  - Example: `res.status(200).json({data: {type: "food", color: "red"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the parameters in the request body is an empty string
- Returns a 400 error if the type of category passed in the request body represents an already existing category in the database
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const createCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({
                error: "Unauthorized",
            });
        }

        if (
            !req.body.hasOwnProperty("type") ||
            !req.body.hasOwnProperty("color")
        ) {
            return res
                .status(400)
                .json({ error: "Type or color not provided in request body" });
        }

        const { type, color } = req.body;

        if (type === "" || color === "") {
            return res
                .status(400)
                .json({ error: "Type or color cannot be empty" });
        }

        const cat = await categories.findOne({ type: type });
        if (cat) {
            return res.status(400).json({ error: "Category already present" });
        }
        const new_categories = new categories({ type, color });

        const data = await new_categories.save();

        res.status(200).json({
            data: {
                type: data.type,
                color: data.color,
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Edit a category's type or color
  - Request Parameters: A string equal to the `type` of the category that must be edited
  - Example: `api/categories/food`
- Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Example: `{type: "Food", color: "yellow"}`
- Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Example: `res.status(200).json({data: {message: "Category edited successfully", count: 2}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- In case any of the following errors apply then the category is not updated, and transactions are not changed
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the parameters in the request body is an empty string
- Returns a 400 error if the type of category passed as a route parameter does not represent a category in the database
- Returns a 400 error if the type of category passed in the request body as the new type represents an already existing category in the database
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const updateCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });

        if (!adminAuth.authorized) {
            return res.status(401).json({
                error: adminAuth.cause,
            });
        }
        if (
            !req.body.hasOwnProperty("type") ||
            !req.body.hasOwnProperty("color")
        ) {
            return res
                .status(400)
                .json({ error: "Type or color not provided in request body" });
        }
        const { type, color } = req.body;

        if (type === "" || color === "") {
            return res
                .status(400)
                .json({ error: "Type or color cannot be empty" });
        }
        // check on the cateogry to update
        const oldCateogory = await categories.findOne({
            type: req.params.type,
        });
        if (!oldCateogory) {
            return res.status(400).json({
                error: "The category does not exist",
            });
        }

        // check the values in the body

        // check for new type in the db
        const newType = await categories.findOne({ type: type });
        if (newType) {
            return res
                .status(400)
                .json({ error: "new category is already in the database" });
        }

        await categories.updateOne(
            { type: req.params.type },
            { type: type, color: color }
        );

        // will now have to update all transactions that had the previous type
        const changedTransactions = await transactions.updateMany(
            { type: req.params.type },
            { type: type }
        );

        res.status(200).json({
            data: {
                message: "Category edited successfully",
                count: changedTransactions.modifiedCount,
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a category
  - Request Parameters: None
- Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Example: `{types: ["health"]}`
- Response `data` Content: An object with an attribute `message` that confirms successful deletion and an attribute `count` that specifies the number of transactions that have had their category type changed
  - Example: `res.status(200).json({data: {message: "Categories deleted", count: 1}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Given N = categories in the database and T = categories to delete:
  - If N > T then all transactions with a category to delete must have their category set to the oldest category that is not in T
  - If N = T then the oldest created category cannot be deleted and all transactions must have their category set to that category
- In case any of the following errors apply then no category is deleted
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if called when there is only one category in the database
- Returns a 400 error if at least one of the types in the array is an empty string
- Returns a 400 error if at least one of the types in the array does not represent a category in the database
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteCategory = async (req, res) => {
    // router.delete("/categories", deleteCategory);
    let count = 0;
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({
                error: "Unauthorized",
            });
        }

        if (!req.body.hasOwnProperty("types")) {
            return res
                .status(400)
                .json({ error: "Body does not have types property" });
        }

        if (req.body.types.length == 0) {
            return res.status(400).json({ error: "Cannot pass empty array" });
        }

        const types = req.body.types;

        const categoriesCount = await categories.countDocuments();
        if (categoriesCount == 1) {
            return res
                .status(400)
                .json({ error: "Cannot delete, only one category is present" });
        }

        for (const type of types) {
            if (type === "") {
                return res
                    .status(400)
                    .json({ error: "Category cannot be an empty string" });
            }
            const category = await categories.findOne({ type: type });
            if (!category)
                return res.status(400).json({
                    error: `The ${type} category does not exist`,
                });
        }

        // get the first cateogry in the db
        let first;

        if (categoriesCount == types.length) {
            first = await categories.aggregate([
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $limit: 1,
                },
            ]);
            // first = await categories
            //     .find({})
            //     .sort({ createdAt: -1 })
            //     .limit(1)
            //     .findOne();
        } else {
            first = await categories.aggregate([
                {
                    $match: { type: { $nin: types } },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $limit: 1,
                },
            ]);
            // first = await categories
            //     .findOne({ type: { $nin: types } })
            //     .sort({ createdAt: -1 })
            //     .limit(1)
            //     .findOne();
        }

        for (const type of types) {
            // need to skip the first cateogory
            if (type == first[0].type && categoriesCount == types.length)
                continue;

            await categories.deleteOne({ type: type });

            const updated = await transactions.updateMany(
                { type: type },
                { type: first[0].type }
            );

            count += updated.modifiedCount;
        }

        res.status(200).json({
            data: { message: "Categories deleted", count: count },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Return all the categories
  - Request Parameters: None
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Example: `res.status(200).json({data: [{type: "food", color: "red"}, {type: "health", color: "green"}], refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 401 error if called by a user who is not authenticated (authType = Simple)
 */
export const getCategories = async (req, res) => {
    try {
        const simpleAuth = verifyAuth(req, res, { authType: "Simple" });
        if (!simpleAuth.authorized) {
            return res.status(401).json({
                error: simpleAuth.cause,
            });
        }
        let data = await categories.find({});

        let filter = data.map((v) =>
            Object.assign({}, { type: v.type, color: v.color })
        );

        return res.status(200).json({
            data: filter,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Create a new transaction made by a specific user
  - Request Parameters: A string equal to the `username` of the involved user
  - Example: `/api/users/Mario/transactions`
- Request Body Content: An object having attributes `username`, `type` and `amount`
  - Example: `{username: "Mario", amount: 100, type: "food"}`
- Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Example: `res.status(200).json({data: {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the parameters in the request body is an empty string
- Returns a 400 error if the type of category passed in the request body does not represent a category in the database
- Returns a 400 error if the username passed in the request body is not equal to the one passed as a route parameter
- Returns a 400 error if the username passed in the request body does not represent a user in the database
- Returns a 400 error if the username passed as a route parameter does not represent a user in the database
- Returns a 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted)
- Returns a 401 error if called by an authenticated user who is not the same user as the one in the route parameter (authType = User)
 */
export const createTransaction = async (req, res) => {
    try {
        const userAuth = verifyAuth(req, res, {
            authType: "User",
            username: req.params.username,
        });
        if (!userAuth.authorized) {
            return res.status(401).json({
                error: userAuth.cause,
            });
        }

        if (
            !req.body.hasOwnProperty("username") ||
            !req.body.hasOwnProperty("amount") ||
            !req.body.hasOwnProperty("type")
        ) {
            return res
                .status(400)
                .json({ error: "Body does not have all the properties" });
        }

        const { username, amount, type } = req.body;

        if (username === "" || amount === "" || type === "") {
            return res
                .status(400)
                .json({ error: "Body properties must be non empty" });
        }

        // check that the type provided exists
        const category = await categories.findOne({ type: type });
        if (!category) {
            return res.status(400).json({
                error: `The provided type(${type}) is not an existing category`,
            });
        }

        if (username != req.params.username) {
            return res.status(400).json({
                error: `Cannot create a transaction for another user`,
            });
        }

        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(400).json({
                error: `The provided username(${username}) is not an associated to an existing user`,
            });
        }

        const userParam = await User.findOne({ username: req.params.username });
        if (!userParam) {
            return res.status(400).json({
                error: `The provided username(${req.params.username}) in the params is not an associated to an existing user`,
            });
        }

        if (isNaN(parseFloat(amount))) {
            return res.status(400).json({
                error: `Amount cannot be converted to a float`,
            });
        }

        const new_transactions = new transactions({ username, amount, type });
        const data = await new_transactions.save();

        res.status(200).json({
            data: {
                username: data.username,
                amount: data.amount,
                type: data.type,
                date: data.date,
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Return all transactions made by all users
  
- Request Parameters: None
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ], refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */

export const getAllTransactions = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({
                error: adminAuth.cause,
            });
        }
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */

        const transactionsWithCategories = await transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categoriesInfo",
                },
            },
            { $unwind: "$categoriesInfo" },
        ]);

        const data = transactionsWithCategories.map((v) =>
            Object.assign(
                {},
                {
                    username: v.username,
                    amount: v.amount,
                    type: v.type,
                    color: v.categoriesInfo.color,
                    date: v.date,
                }
            )
        );

        res.json({
            data: data,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
/**
 * Return all transactions made by a specific user
  - Request Parameters: A string equal to the `username` of the involved user
  - Example: `/api/users/Mario/transactions` (user route)
  - Example: `/api/transactions/users/Mario` (admin route)
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the username passed as a route parameter does not represent a user in the database
- Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username`
- Can be filtered by date and amount if the necessary query parameters are present and if the route is `/api/users/:username/transactions`
 */
// TOADD: implement query parameters control
export const getTransactionsByUser = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username,
        });
        if (!user) {
            return res.status(400).json({ error: "user not found" });
        }
        if (req.url.includes("transactions/users")) {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" });
            if (!adminAuth.authorized) {
                return res.status(401).json({
                    error:
                        "Unauthorized usage of exclusive path /transaction/users/user use api/users/" +
                        req.params.username +
                        "/transactions instead",
                });
            }

            //Admin auth successful
            const data = await transactions.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categoriesInfo",
                    },
                },
                { $unwind: "$categoriesInfo" },
                {
                    $match: {
                        username: req.params.username,
                    },
                },
            ]);

            const result = data.map((v) =>
                Object.assign(
                    {},
                    {
                        username: v.username,
                        amount: v.amount,
                        type: v.type,
                        color: v.categoriesInfo.color,
                        date: v.date,
                    }
                )
            );

            return res.status(200).json({
                data: result,
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });
        } else {
            // the path is not transactions first so it should be called by user
            // we check user
            const userAuth = verifyAuth(req, res, {
                authType: "User",
                username: req.params.username,
            });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause });
                //error for auth
            }

            const dateQuery = handleDateFilterParams(req); //get the query to filter the date
            const amountQuery = handleAmountFilterParams(req); //get the query to filter the amount

            let filterQuery = {
                username: req.params.username,
            };

            if (dateQuery && Object.entries(dateQuery).length != 0)
                filterQuery.date = dateQuery.date;
            if (amountQuery && Object.entries(amountQuery).length != 0)
                filterQuery.amount = amountQuery.amount;

            const data = await transactions.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categoriesInfo",
                    },
                },
                { $unwind: "$categoriesInfo" },
                {
                    $match: filterQuery,
                },
            ]);

            const result = data.map((v) =>
                Object.assign(
                    {},
                    {
                        username: v.username,
                        amount: v.amount,
                        type: v.type,
                        color: v.categoriesInfo.color,
                        date: v.date,
                    }
                )
            );
            return res.status(200).json({
                data: result,
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Return all transactions made by a specific user filtered by a specific category
  - The behavior defined below applies only for the specified route
- Request Parameters: A string equal to the `username` of the involved user, a string equal to the requested `category`
  - Example: `/api/users/Mario/transactions/category/food` (user route)
  - Example: `/api/transactions/users/Mario/category/food` (admin route)
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the username passed as a route parameter does not represent a user in the database
- Returns a 400 error if the category passed as a route parameter does not represent a category in the database
- Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions/category/:category`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username/category/:category`
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username,
        });
        if (!user) {
            return res.status(400).json({ error: "user not found" });
        }

        const type = await categories.findOne({
            type: req.params.category,
        });

        if (!type) {
            return res.status(400).json({ error: "category not found" });
        }

        if (req.url.includes("transactions/users")) {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" });
            if (!adminAuth.authorized) {
                return res.status(401).json({
                    error: "Unauthorized usage of exclusive path /transaction/users/user/categories/category use /users/:username/transactions instead",
                });
            }
            //Admin auth successful
            const data = await transactions.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categoriesInfo",
                    },
                },
                { $unwind: "$categoriesInfo" },
                {
                    $match: {
                        username: req.params.username,
                        "categoriesInfo.type": req.params.category,
                    },
                },
            ]);

            const result = data.map((v) =>
                Object.assign(
                    {},
                    {
                        username: v.username,
                        amount: v.amount,
                        type: v.type,
                        color: v.categoriesInfo.color,
                        date: v.date,
                    }
                )
            );

            return res.status(200).json({
                data: result,
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });
        } else {
            // the path is not transactions first so it should be called by user
            // we check user
            const userAuth = verifyAuth(req, res, {
                authType: "User",
                username: req.params.username,
            });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause });
                //error for auth
            }
            //User auth successful

            if (user.username != req.params.username) {
                return res.status(401).json({
                    error: "Username provided in the url is not the same as the one logged in, Unauthorized. ",
                });
            }
            const data = await transactions.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categoriesInfo",
                    },
                },
                { $unwind: "$categoriesInfo" },
                {
                    $match: {
                        username: req.params.username,
                        "categoriesInfo.type": req.params.category,
                    },
                },
            ]);

            const result = data.map((v) =>
                Object.assign(
                    {},
                    {
                        username: v.username,
                        amount: v.amount,
                        type: v.type,
                        color: v.categoriesInfo.color,
                        date: v.date,
                    }
                )
            );

            return res.status(200).json({
                data: result,
                refreshedTokenMessage: res.locals.refreshedTokenMessage,
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Return all transactions made by members of a specific group
  - Request Parameters: A string equal to the `name` of the requested group
  - Example: `/api/groups/Family/transactions` (user route)
  - Example: `/api/transactions/groups/Family` (admin route)
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
- Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `/api/groups/:name/transactions`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/groups/:name`
 */
// TO IMPLEMENT LAST ERROR MESSAGE
export const getTransactionsByGroup = async (req, res) => {
    try {
        const namegroup = req.params.name;

        const group = await Group.findOne({ name: namegroup });

        if (!group) {
            return res.status(400).json({ error: "Group not found" });
        }

        let transactionInData = [];
        // check the problem

        const emails = group.members.map((member) => member.email);

        if (
            req.url.includes("transactions/groups") &&
            !verifyAuth(req, res, { authType: "Admin" }).authorized
        ) {
            return res.status(401).json({ error: "Admin exclusive route" });
        } else {
            // not admin or in user path
            if (
                !verifyAuth(req, res, {
                    authType: "Group",
                    emails: emails,
                }).authorized
            ) {
                return res
                    .status(401)
                    .json({ error: "Requesting user not in group" });
            }
        }

        let usernames = [];

        for (let email of emails) {
            const user = await User.findOne({ email: email });
            usernames.push(user.username);
        }

        for (const username of usernames) {
            const data = await transactions.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categoriesInfo",
                    },
                },
                { $unwind: "$categoriesInfo" },
                {
                    $match: {
                        username: username,
                    },
                },
            ]);

            const result = data.map((v) =>
                Object.assign(
                    {},
                    {
                        username: v.username,
                        amount: v.amount,
                        type: v.type,
                        color: v.categoriesInfo.color,
                        date: v.date,
                    }
                )
            );

            transactionInData.push(result);
        }
        res.status(200).json({
            data: transactionInData.flat(),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Parameters: A string equal to the `name` of the requested group, a string equal to the requested `category`
  - Example: `/api/groups/Family/transactions/category/food` (user route)
  - Example: `/api/transactions/groups/Family/category/food` (admin route)
- Request Body Content: None
- Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Example: `res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, {username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ] refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
- Returns a 400 error if the category passed as a route parameter does not represent a category in the database
- Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `/api/groups/:name/transactions/category/:category`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/groups/:name/category/:category`
 */

export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
        const namegroup = req.params.name;
        const namecategory = req.params.category;

        const group = await Group.findOne({ name: namegroup });
        if (!group) {
            return res.status(400).json({ error: "Group not found" });
        }

        const category = await categories.findOne({ type: namecategory });
        if (!category) {
            return res.status(400).json({ error: "Cateogory not found" });
        }

        let transactionInData = [];

        const emails = group.members.map((member) => member.email);

        if (
            req.url.includes("transactions/groups") &&
            !verifyAuth(req, res, { authType: "Admin" }).authorized
        ) {
            return res.status(401).json({ error: "Admin exclusive route" });
        } else {
            // not admin or in user path
            if (
                !verifyAuth(req, res, {
                    authType: "Group",
                    emails: emails,
                }).authorized
            ) {
                return res
                    .status(401)
                    .json({ error: "Requesting user not in group" });
            }
        }

        let usernames = [];

        for (let email of emails) {
            const user = await User.findOne({ email: email });
            usernames.push(user.username);
        }

        for (const username of usernames) {
            const data = await transactions.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categoriesInfo",
                    },
                },
                {
                    $unwind: "$categoriesInfo",
                },
                {
                    $match: {
                        "categoriesInfo.type": req.params.category,
                        username: username,
                    },
                },
            ]);

            const result = data.map((v) =>
                Object.assign(
                    {},
                    {
                        username: v.username,
                        amount: v.amount,
                        type: v.type,
                        color: v.categoriesInfo.color,
                        date: v.date,
                    }
                )
            );

            transactionInData.push(result);
        }

        res.status(200).json({
            data: transactionInData.flat(),
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a transaction made by a specific user
  - Request Parameters: A string equal to the `username` of the involved user
  - Example: `/api/users/Mario/transactions`
- Request Body Content: The `_id` of the transaction to be deleted
  - Example: `{_id: "6hjkohgfc8nvu786"}`
- Response `data` Content: A string indicating successful deletion of the transaction
  - Example: `res.status(200).json({data: {message: "Transaction deleted"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the username passed as a route parameter does not represent a user in the database
- Returns a 400 error if the `_id` in the request body does not represent a transaction in the database
- Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User)
 */
export const deleteTransaction = async (req, res) => {
    try {
        if (!req.body || !req.body.hasOwnProperty("_id")) {
            return res
                .status(400)
                .json({ error: "Body does not have _id property" });
        }

        if (req.body._id == "") {
            return res
                .status(400)
                .json({ error: "_id cannot be empty string" });
        }

        const user = await User.findOne({
            username: req.params.username,
        });
        if (!user) {
            return res.status(400).json({ error: "user not found" });
        }

        const toDelete = await transactions.findOne({ _id: req.body._id });
        if (!toDelete) {
            return res
                .status(400)
                .json({ error: "Transaction does not exist" });
        }

        const userAuth = verifyAuth(req, res, {
            authType: "User",
            username: req.params.username,
        });
        if (!userAuth.authorized) {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" });

            if (!adminAuth.authorized) {
                return res.status(401).json({
                    error: "deleting transaction for user different from the logged one",
                });
            }
        }

        if (userAuth.authorized && toDelete.username != req.params.username) {
            return res
                .status(400)
                .json({ error: "Cannot delete another users transaction" });
        }

        await transactions.deleteOne({ _id: req.body._id });

        res.status(200).json({
            data: { message: "Transaction deleted" },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
- Request Parameters: None
- Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Example: `{_ids: ["6hjkohgfc8nvu786"]}`
- Response `data` Content: A message confirming successful deletion
  - Example: `res.status(200).json({data: {message: "Transactions deleted"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- In case any of the following errors apply then no transaction is deleted
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the ids in the array is an empty string
- Returns a 400 error if at least one of the ids in the array does not represent a transaction in the database
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteTransactions = async (req, res) => {
    try {
        if (!req.body.hasOwnProperty("_ids")) {
            return res
                .status(400)
                .json({ error: "Body does not have _id property" });
        }

        const idsToBeDeleted = req.body._ids;

        if (idsToBeDeleted.some((id) => id === "")) {
            return res
                .status(400)
                .json({ error: "id cannot be an empty string" });
        }

        const adminAuth = verifyAuth(req, res, { authType: "Admin" });

        if (!adminAuth.authorized) {
            return res.status(401).json({
                error: adminAuth.cause,
            });
        }

        let differentIds = [...new Set(idsToBeDeleted)];

        const foundTransactions = await transactions.find({
            _id: { $in: differentIds },
        });

        if (foundTransactions.length != differentIds.length) {
            return res.status(400).json({
                error: "One or more ids not found",
            });
        }

        await transactions.deleteMany({
            _id: { $in: differentIds },
        });

        res.status(200).json({
            data: { message: "Transactions deleted" },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
