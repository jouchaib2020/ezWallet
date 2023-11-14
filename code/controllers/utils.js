import jwt from "jsonwebtoken";
import { Group, User } from "../models/User.js";

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */
export const handleDateFilterParams = (req) => {
    const date = req.query.date;
    const upTo = req.query.upTo;
    const from = req.query.from;
    const filter = {};
    // const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateRegex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

    if (date) {
        if (from || upTo) {
            throw new Error("Can't use date filter together with from or upTo");
        }
        if (!dateRegex.test(date)) {
            throw new Error(`Invalid date format: Expected format: YYYY-MM-DD`);
        }
        const date1 = new Date(date);
        let nextDay = new Date(date1);
        nextDay.setDate(nextDay.getDate() + 1);
        let endOfDay = new Date(nextDay.valueOf() - 1);

        filter.date = {
            $gte: date1,
            $lte: endOfDay,
        };
    } else {
        if (from) {
            if (!dateRegex.test(from)) {
                throw new Error(
                    `Invalid date format: Expected format: YYYY-MM-DD`
                );
            }
            const fromDate = new Date(from);
            filter.date = {
                $gte: fromDate,
            };
        }

        if (upTo) {
            if (!dateRegex.test(upTo)) {
                throw new Error(
                    `Invalid date format: Expected format: YYYY-MM-DD`
                );
            }
            const upToDate = new Date(upTo);

            let nextDay = new Date(upToDate);
            nextDay.setDate(nextDay.getDate() + 1);
            let endOfDay = new Date(nextDay.valueOf() - 1);
            filter.date = {
                ...filter.date,
                $lte: endOfDay,
            };
        }
    }

    return filter;
};

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */

// const simpleAuth = verifyAuth(req, res, {authType: "Simple"})
// const userAuth = verifyAuth(req, res, {authType: "User", username: req.params.username})
// const adminAuth = verifyAuth(req, res, {authType: "Admin"})
// const groupAuth = verifyAuth(req, res, {authType: "Group", emails: <array of emails>})

export const verifyAuth = (req, res, info) => {
    const cookie = req.cookies;

    if (!cookie.accessToken || !cookie.refreshToken) {
        return { authorized: false, cause: "Unauthorized" };
    }
    try {
        const decodedAccessToken = jwt.verify(
            cookie.accessToken,
            process.env.ACCESS_KEY
        );
        // const decodedRefreshToken = jwt.verify(
        //     cookie.refreshToken,
        //     process.env.ACCESS_KEY
        // );
        const decodedRefreshToken = jwt.verify(
            cookie.refreshToken,
            process.env.ACCESS_KEY
        );
        if (
            !decodedAccessToken.username ||
            !decodedAccessToken.email ||
            !decodedAccessToken.role
        ) {
            return { authorized: false, cause: "Token is missing information" };
        }
        if (
            !decodedRefreshToken.username ||
            !decodedRefreshToken.email ||
            !decodedRefreshToken.role
        ) {
            return { authorized: false, cause: "Token is missing information" };
        }

        if (
            decodedAccessToken.username !== decodedRefreshToken.username ||
            decodedAccessToken.email !== decodedRefreshToken.email ||
            decodedAccessToken.role !== decodedRefreshToken.role
        ) {
            return { authorized: false, cause: "Mismatched users" };
        }

        if (info.authType == "User") {
            if (
                info.username !== decodedAccessToken.username ||
                info.username !== decodedRefreshToken.username ||
                decodedAccessToken.role === "Admin"
            ) {
                return {
                    authorized: false,
                    cause: "Username in url params doesn't match the token",
                };
            }
        }
        if (info.authType === "Admin") {
            if (
                decodedAccessToken.role === "Regular" ||
                decodedRefreshToken.role === "Regular"
            ) {
                return { authorized: false, cause: "Logged user is not admin" };
            }
        }
        if (
            info.authType === "Group" &&
            decodedRefreshToken.role === "Regular"
        ) {
            if (
                !info.emails ||
                !info.emails.includes(decodedAccessToken.email) ||
                !info.emails.includes(decodedRefreshToken.email)
            ) {
                return {
                    authorized: false,
                    cause: "User is not a part of the group",
                };
            }
        }
        return { authorized: true, cause: "Authorized" };
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            try {
                // check on expired token
                const refreshToken = jwt.verify(
                    cookie.refreshToken,
                    process.env.ACCESS_KEY
                );

                if (
                    info.authType == "User" &&
                    info.username !== refreshToken.username
                ) {
                    return {
                        authorized: false,
                        cause: "Username doesn't match the token",
                    };
                }
                if (
                    info.authType === "Admin" &&
                    refreshToken.role === "Regular"
                ) {
                    return {
                        authorized: false,
                        cause: "Logged user is not admin",
                    };
                }
                if (
                    info.authType === "Group" &&
                    refreshToken.role === "Regular"
                ) {
                    if (
                        !info.emails ||
                        !info.emails.includes(refreshToken.email)
                    ) {
                        return {
                            authorized: false,
                            cause: "User is not a part of the group",
                        };
                    }
                }

                const newAccessToken = jwt.sign(
                    {
                        username: refreshToken.username,
                        email: refreshToken.email,
                        id: refreshToken.id,
                        role: refreshToken.role,
                    },
                    "EZWALLET",
                    { expiresIn: "1h" }
                );

                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    path: "/api",
                    maxAge: 60 * 60 * 1000,
                    sameSite: "none",
                    secure: true,
                });
                res.locals.refreshedTokenMessage =
                    "Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls";
                return { authorized: true, cause: "Authorized" };
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    return { authorized: false, cause: "Perform login again" };
                } else {
                    return { authorized: false, cause: err.name };
                }
            }
        } else {
            return { authorized: false, cause: err.name };
        }
    }
};

/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */
export const handleAmountFilterParams = (req) => {
    const min = req.query.min;
    const max = req.query.max;

    if (min || max) {
        if ((min && isNaN(Number(min))) || (max && isNaN(Number(max)))) {
            throw new Error(
                `Invalid numerical value: Expected a numerical input.`
            );
        }
    }

    let filter = {};
    if (min) {
        filter.amount = {
            ...filter.amount,
            $gte: parseInt(min),
        };
    }
    if (max) {
        filter.amount = {
            ...filter.amount,
            $lte: parseInt(max),
        };
    }

    return filter;
};

export const findExistingMembers = async (memberEmails) => {
    const existingMembers = [];
    const alreadyInGroupMembers = [];
    const notFoundMembers = [];

    for (const email of memberEmails) {
        const existingMember = await User.findOne({ email });

        if (existingMember) {
            existingMembers.push(email);

            const group = await Group.findOne({ "members.email": email });
            if (group) {
                alreadyInGroupMembers.push(email);
            }
        } else {
            notFoundMembers.push(email);
        }
    }
    return { existingMembers, alreadyInGroupMembers, notFoundMembers };
};
