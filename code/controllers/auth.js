import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { verifyAuth } from "./utils.js";

/**
#### `register`

- Request Parameters: None
- Request Body Content: An object having attributes `username`, `email` and `password`
  - Example: `{username: "Mario", email: "mario.red@email.com", password: "securePass"}`
- Response `data` Content: A message confirming successful insertion
  - Example: `res.status(200).json({data: {message: "User added successfully"}})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the parameters in the request body is an empty string
- Returns a 400 error if the email in the request body is not in a valid email format
- Returns a 400 error if the username in the request body identifies an already existing user
- Returns a 400 error if the email in the request body identifies an already existing user
 */
export const register = async (req, res) => {
    try {
        if (
            !req.body.hasOwnProperty("username") ||
            !req.body.hasOwnProperty("email") ||
            !req.body.hasOwnProperty("password")
        ) {
            return res.status(400).json({
                error: "missing one or more neccessary attributes",
            });
        }

        if (
            req.body.username == "" ||
            req.body.email == "" ||
            req.body.password == ""
        ) {
            return res.status(400).json({
                error: "all the attributes must not be empty strings",
            });
        }

        const { username, email, password } = req.body;
        const validRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!validRegex.test(email)) {
            return res.status(400).json({
                error: "email must be a valid address format",
            });
        }

        const existingUserEmail = await User.findOne({ email: req.body.email });
        if (existingUserEmail)
            return res.status(400).json({ error: "email already registered" });
        const existingUserUsername = await User.findOne({
            username: req.body.username,
        });

        if (existingUserUsername)
            return res.status(400).json({ error: "username already used" });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(200).json({ data: { message: "User added successfully" } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
- Request Parameters: None
- Request Body Content: An object having attributes `username`, `email` and `password`
  - Example: `{username: "admin", email: "admin@email.com", password: "securePass"}`
- Response `data` Content: A message confirming successful insertion
  - Example: `res.status(200).json({data: {message: "User added successfully"}})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the parameters in the request body is an empty string
- Returns a 400 error if the email in the request body is not in a valid email format
- Returns a 400 error if the username in the request body identifies an already existing user
- Returns a 400 error if the email in the request body identifies an already existing user
 */
export const registerAdmin = async (req, res) => {
    try {
        if (
            !req.body.hasOwnProperty("username") ||
            !req.body.hasOwnProperty("email") ||
            !req.body.hasOwnProperty("password")
        ) {
            return res.status(400).json({
                error: "missing one or more neccessary attributes",
            });
        }

        if (
            req.body.username == "" ||
            req.body.email == "" ||
            req.body.password == ""
        ) {
            return res.status(400).json({
                error: "all the attributes must not be empty strings",
            });
        }
        const emailToCheck = req.body.email;

        const validRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!validRegex.test(emailToCheck)) {
            return res.status(400).json({
                error: "email must be a valid address format",
            });
        }

        const { username, email, password } = req.body;
        const existingUserEmail = await User.findOne({ email: req.body.email });
        const existingUserUsername = await User.findOne({
            username: req.body.username,
        });
        if (existingUserEmail)
            return res.status(400).json({ error: "email already registered" });
        if (existingUserUsername)
            return res.status(400).json({ error: "username already used" });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "Admin",
        });

        return res
            .status(200)
            .json({ data: { message: "Admin added successfully" } });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
#### `login`

- Request Parameters: None
- Request Body Content: An object having attributes `email` and `password`
  - Example: `{email: "mario.red@email.com", password: "securePass"}`
- Response `data` Content: An object with the created accessToken and refreshToken
  - Example: `res.status(200).json({data: {accessToken: accessToken, refreshToken: refreshToken}})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if at least one of the parameters in the request body is an empty string
- Returns a 400 error if the email in the request body is not in a valid email format
- Returns a 400 error if the email in the request body does not identify a user in the database
- Returns a 400 error if the supplied password does not match with the one in the database
 */
export const login = async (req, res) => {
    try {
        if (
            !req.body.hasOwnProperty("email") ||
            !req.body.hasOwnProperty("password")
        ) {
            return res.status(400).json({
                error: "missing one or more neccessary attributes",
            });
        }

        if (req.body.email == "" || req.body.password == "") {
            return res.status(400).json({
                error: "all the attributes must not be empty strings",
            });
        }
        const { email, password } = req.body;

        const validRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!validRegex.test(email)) {
            return res.status(400).json({
                error: "email must be a valid address format",
            });
        }

        const cookie = req.cookies;
        const existingUser = await User.findOne({ email: email });

        if (!existingUser)
            return res
                .status(400)
                .json({ error: "User not found. Please register" });
        const match = await bcrypt.compare(password, existingUser.password);

        if (!match)
            return res.status(400).json({ error: "Wrong password retry" });
        //CREATE ACCESSTOKEN
        const accessToken = jwt.sign(
            {
                email: existingUser.email,
                id: existingUser.id,
                username: existingUser.username,
                role: existingUser.role,
            },
            process.env.ACCESS_KEY,
            { expiresIn: "1h" }
        );
        //CREATE REFRESH TOKEN
        const refreshToken = jwt.sign(
            {
                email: existingUser.email,
                id: existingUser.id,
                username: existingUser.username,
                role: existingUser.role,
            },
            process.env.ACCESS_KEY,
            { expiresIn: "7d" }
        );
        //SAVE REFRESH TOKEN TO DB
        existingUser.refreshToken = refreshToken;
        const savedUser = await existingUser.save();
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            domain: "localhost",
            path: "/api",
            maxAge: 60 * 60 * 1000,
            sameSite: "none",
            secure: true,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            domain: "localhost",
            path: "/api",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true,
        });
        return res.status(200).json({
            data: { accessToken: accessToken, refreshToken: refreshToken },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
#### `logout`

- Request Parameters: None
- Request Body Content: None
- Response `data` Content: A message confirming successful logout
  - Example: `res.status(200).json({data: {message: "User logged out"}})`
- Returns a 400 error if the request does not have a refresh token in the cookies
- Returns a 400 error if the refresh token in the request's cookies does not represent a user in the database
 */
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.status(400).json({
                error: "Missing tokens in cookies cannot logout try logging in",
            });

        const user = await User.findOne({ refreshToken: refreshToken });
        if (!user) return res.status(400).json({ error: "User not found" });
        user.refreshToken = null;
        res.cookie("accessToken", "", {
            httpOnly: true,
            path: "/api",
            maxAge: 0,
            sameSite: "none",
            secure: true,
        });
        res.cookie("refreshToken", "", {
            httpOnly: true,
            path: "/api",
            maxAge: 0,
            sameSite: "none",
            secure: true,
        });
        const savedUser = await user.save();
        return res.status(200).json({ data: { message: "User logged out" } });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
