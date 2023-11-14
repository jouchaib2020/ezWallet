import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth, findExistingMembers } from "./utils.js";

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({
                error: "Unauthorized",
            });
        }
        const users = await User.find();
        res.status(200).json({
            data: users,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

/**
Request Parameters: A string equal to the username of the involved user

Example: /api/users/Mario

Request Body Content: None
Response data Content: An object having attributes username, email and role.

Example: res.status(200).json({data: {username: "Mario", email: "mario.red@email.com", role: "Regular"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})

Returns a 400 error if the username passed as the route parameter does not represent a user in the database
Returns a 401 error if called by an authenticated user who is neither the same user as the one in the route parameter (authType = User) nor an admin (authType = Admin)
 */
export const getUser = async (req, res) => {
    try {
        const username = req.params.username;

        const existingUser = await User.findOne({ username });
        if (!existingUser)
            return res.status(400).json({ error: "User not found" });
        console.log(existingUser);
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        const userAuth = verifyAuth(req, res, {
            authType: "User",
            username: username,
        });

        if (!adminAuth.authorized && !userAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        return res.status(200).json({
            data: {
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role,
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

/**
 * Create a new group
- Request Parameters: None
- Request request body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Example: `{name: "Family", memberEmails: ["mario.red@email.com", "luigi.red@email.com"]}`
- Response `data` Content: An object having an attribute `group` (this object must have a string attribute
    for the `name` of the created group and an array for the `members` of the group), an array that lists
     the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists
      the `membersNotFound` (members whose email does not appear in the system)
- Example: `res.status(200).json({data: 
    {group: {name: "Family", 
    members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]
    }, 
    membersNotFound: [],
    alreadyInGroup: []} 
    refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- If the user who calls the API does not have their email in the list of emails then their email is added to the list of members
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the group name passed in the request body is an empty string
- Returns a 400 error if the group name passed in the request body represents an already existing group in the database
- Returns a 400 error if all the provided emails (the ones in the array, the email of the user calling the function 
  does not have to be considered in this case) represent users that are already in a group or do not exist in the database
- Returns a 400 error if the user who calls the API is already in a group
- Returns a 400 error if at least one of the member emails is not in a valid email format
- Returns a 400 error if at least one of the member emails is an empty string
- Returns a 401 error if called by a user who is not authenticated (authType = Simple)
 */
export const createGroup = async (req, res) => {
    try {
        const { name, memberEmails } = req.body;
        const cookie = req.cookies;
        const validRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const result = {
            group: {},
            alreadyInGroup: [],
            membersNotFound: [],
        };
        if (
            !req.body.hasOwnProperty("name") ||
            !req.body.hasOwnProperty("memberEmails")
        ) {
            return res
                .status(400)
                .json({ error: "Missing request body attributes" });
        }

        if (
            name === "" ||
            memberEmails.some((email) => email === "") ||
            !memberEmails.every((email) => validRegex.test(email))
        ) {
            return res.status(400).json({ error: "invalid request body" });
        }

        const simpleAuth = verifyAuth(req, res, { authType: "Simple" });
        if (!simpleAuth.authorized) {
            return res.status(401).json({
                error: "Unauthorized",
            });
        }

        const loggedUser = await User.findOne({
            refreshToken: cookie.refreshToken,
        });

        const existingGroup = await Group.findOne({ name });

        if (existingGroup) {
            return res
                .status(400)
                .json({ error: "Group name already registered" });
        }

        const { existingMembers, notFoundMembers, alreadyInGroupMembers } =
            await findExistingMembers(memberEmails);
        result.alreadyInGroup = alreadyInGroupMembers;
        result.membersNotFound = notFoundMembers;

        if (
            alreadyInGroupMembers.length === existingMembers.length ||
            existingMembers.length === 0
        ) {
            return res.status(400).json({
                error: "all the provided emails are already in a group or do not exist in the database",
            });
        }

        const groupMembers = existingMembers.filter((email) => {
            return !alreadyInGroupMembers.includes(email);
        });

        if (existingMembers.includes(loggedUser.email)) {
            if (!groupMembers.includes(loggedUser.email)) {
                return res.status(400).json({
                    error: "the user who calls the API is already in a group",
                });
            }
        } else {
            const loggedUserGroup = await Group.findOne({
                "members.email": loggedUser.email,
            });
            if (loggedUserGroup) {
                return res.status(400).json({
                    error: "the user who calls the API is already in a group",
                });
            } else {
                groupMembers.push(loggedUser.email);
            }
        }
        const groupUsers = await Promise.all(
            groupMembers.map(async (email) => {
                const member = await User.findOne({ email });
                return {
                    email,
                    user: member.id,
                };
            })
        );
        const newGroup = await Group.create({
            name,
            members: groupUsers,
        });
        result.group = {
            name: newGroup.name,
            members: newGroup.members,
        };

        res.status(200).json({
            data: result,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (err) {
        res.status(500).json(err.message);
    }
};

/**
 * getGroups
- Request Parameters: None
- Request Body Content: None
- Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group and an array for the `members` of the group
  - Example: `res.status(200).json({
    data: [{name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]
}] 
refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const getGroups = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({
                error: "Unauthorized",
            });
        }
        const groups = await Group.find();
        res.status(200).json({
            data: groups,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (err) {
        res.status(500).json(err.message);
    }
};

/**
 * getGroup
 Request Parameters: A string equal to the `name` of the requested group
  - Example: `/api/groups/Family`
- Request Body Content: None
- Response `data` Content: An object having a string attribute for the `name`
of the group and an array for the `members` of the group
  - Example: `res.status(200).json({data: 
    {group: 
        {name: "Family",
        members: [{email: "mario.red@email.com"},{email: "luigi.red@email.com"}]
    }}
     refreshedTokenMessage: res.locals.refreshedTokenMessage})`

    - Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
    - Returns a 401 error if called by an authenticated user who is neither part of the group (authType = Group) nor an admin (authType = Admin)
 */
export const getGroup = async (req, res) => {
    try {
        const name = req.params.name;

        const simpleAuth = verifyAuth(req, res, { authType: "Simple" });
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!simpleAuth.authorized && !adminAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const group = await Group.findOne({ name });
        if (!group) {
            return res.status(400).json({ error: "Group not found" });
        }

        const emails = [];
        group.members.forEach((member) => {
            emails.push(member.email);
        });

        const groupAuth = verifyAuth(req, res, {
            authType: "Group",
            emails: emails,
        });
        if (!groupAuth.authorized && !adminAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        res.status(200).json({
            data: group,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (err) {
        res.status(500).json(err.message);
    }
};

/*
addToGroup
- Request Parameters: A string equal to the `name` of the group
  - Example: `api/groups/Family/add` (user route)
  - Example: `api/groups/Family/insert` (admin route)
- Request Body Content: An array of strings containing the `emails` of the members to add to the group
  - Example: `{emails: ["pietro.blue@email.com"]}`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute
    for the `name` of the created group and an array for the `members` of the group, this array must include
    the new members as well as the old ones), an array that lists the `alreadyInGroup` members
     (members whose email is already present in a group) and an array that lists
      the `membersNotFound` (members whose email does not appear in the system)
- Example: `res.status(200).json({data: 
    {group: {name: "Family", 
    members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}, {email: "pietro.blue@email.com"}]
    }, 
    membersNotFound: [],
     alreadyInGroup: []
    } 
    refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- In case any of the following errors apply then no user is added to the group
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
- Returns a 400 error if all the provided emails represent users that are already in a group or do not exist in the database
- Returns a 400 error if at least one of the member emails is not in a valid email format
- Returns a 400 error if at least one of the member emails is an empty string
- Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/add`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/insert`

*/
export const addToGroup = async (req, res) => {
    try {
        const name = req.params.name;
        const { emails } = req.body;

        const result = {
            group: {},
            alreadyInGroup: [],
            membersNotFound: [],
        };
        if (!req.body.hasOwnProperty("emails")) {
            return res
                .status(400)
                .json({ error: "Missing request body attributes" });
        }
        const validRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (
            name === "" ||
            emails.some((email) => email === "") ||
            !emails.every((email) => validRegex.test(email))
        ) {
            return res.status(400).json({ error: "invalid request body" });
        }

        const simpleAuth = verifyAuth(req, res, { authType: "Simple" });
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!simpleAuth.authorized && !adminAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const group = await Group.findOne({ name });
        if (!group) return res.status(400).json({ error: "Group not found" });

        const groupAuth = verifyAuth(req, res, {
            authType: "Group",
            emails: emails,
        });
        if (groupAuth.authorized && !adminAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { existingMembers, notFoundMembers, alreadyInGroupMembers } =
            await findExistingMembers(emails);
        result.alreadyInGroup = alreadyInGroupMembers;
        result.membersNotFound = notFoundMembers;

        if (
            existingMembers.length === alreadyInGroupMembers.length ||
            existingMembers.length == 0
        ) {
            return res.status(400).json({
                error: "all the provided emails are already in a group or do not exist in the database",
            });
        }

        const newMembers = existingMembers.filter(
            (email) => !alreadyInGroupMembers.includes(email)
        );

        const newUsers = await Promise.all(
            newMembers.map(async (email) => {
                const member = await User.findOne({ email });
                return {
                    email,
                    user: member.id,
                };
            })
        );
        group.members.push(...newUsers);

        const updatedGroup = await group.save();
        result.group = {
            name: updatedGroup.name,
            members: updatedGroup.members,
        };
        res.status(200).json({
            data: result,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (err) {
        res.status(500).json(err.message);
    }
};

/**
 * removeFromGroup
- Request Parameters: A string equal to the `name` of the group
  - Example: `api/groups/Family/remove` (user route)
  - Example: `api/groups/Family/pull` (admin route)
- Request Body Content: An array of strings containing the `emails` of the members to remove from the group
  - Example: `{emails: ["pietro.blue@email.com"]}`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute
     for the `name` of the created group and an array for the `members` of the group, this array must include 
     only the remaining members)an array that lists the `notInGroup` members (members whose email is not in
     the group) and an array that lists the `membersNotFound` (members whose email does not appear in the system)
    - Example: `res.status(200).json({data:
         {group:
            {name: "Family", members: [{email: "mario.red@email.com"},{email: "luigi.red@email.com"}]
        },
        membersNotFound: [],
        notInGroup: []
        }
        refreshedTokenMessage: res.locals.refreshedTokenMessage
    })`

- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
- Returns a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database
- Returns a 400 error if at least one of the emails is not in a valid email format
- Returns a 400 error if at least one of the emails is an empty string
- Returns a 400 error if the group contains only one member before deleting any user
- Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/remove`
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`
 */
export const removeFromGroup = async (req, res) => {
    try {
        const name = req.params.name;
        const { emails } = req.body;
        const validRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const result = {
            group: {},
            notInGroup: [],
            membersNotFound: [],
        };

        if (!req.body.hasOwnProperty("emails")) {
            return res
                .status(400)
                .json({ error: "Missing request body attributes" });
        }

        if (
            name === "" ||
            emails.some((email) => email === "") ||
            !emails.every((email) => validRegex.test(email))
        ) {
            return res.status(400).json({ error: "invalid request body" });
        }
        const existingGroup = await Group.findOne({ name });

        if (!existingGroup)
            return res.status(400).json({ error: "Group not found" });

        if (existingGroup.members.length === 1)
            return res
                .status(400)
                .json({ error: "the group contains only one member" });

        const membersEmails = existingGroup.members.map(
            (member) => member.email
        );

        const { authorized } = verifyAuth(req, res, {
            authType: "Group",
            emails: membersEmails,
        });
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });

        if (!authorized && adminAuth.authorized === false) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { existingMembers, alreadyInGroupMembers, notFoundMembers } =
            await findExistingMembers(emails);
        result.membersNotFound = notFoundMembers;
        result.notInGroup = existingMembers.filter(
            (email) => !membersEmails.includes(email)
        );
        if (
            existingMembers.length === result.notInGroup.length ||
            existingMembers.length === 0 ||
            alreadyInGroupMembers.length === 0
        ) {
            return res.status(400).json({
                error: "all the provided emails do not belong to the group or do not exist in the database",
            });
        }
        const updatedMembers = existingGroup.members.filter((member) => {
            return (
                !existingMembers.includes(member.email) &&
                !result.notInGroup.includes(member.email)
            );
        });

        existingGroup.members = updatedMembers;

        const updatedGroup = await existingGroup.save();
        result.group = {
            name: updatedGroup.name,
            members: updatedGroup.members,
        };
        res.status(200).json({
            data: result,
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (err) {
        res.status(500).json(err.message);
    }
};

/**
 * Delete a user
  - Request Parameters: None
- Request Body Content: A string equal to the `email` of the user to be deleted
  - Example: `{email: "luigi.red@email.com"}`
- Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and an attribute that specifies whether the user was also `deletedFromGroup` or not
  - Example: `res.status(200).json({data: {deletedTransaction: 1, deletedFromGroup: true}, refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- If the user is the last user of a group then the group is deleted as well
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the email passed in the request body is an empty string
- Returns a 400 error if the email passed in the request body is not in correct email format
- Returns a 400 error if the email passed in the request body does not represent a user in the database
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteUser = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({
                error: "Unauthorized",
            });
        }

        if (!req.body.hasOwnProperty("email")) {
            return res.status(400).json({
                error: "Email property missing in the request body",
            });
        }

        if (req.body.email === "") {
            return res.status(400).json({
                error: "Email cannot be empty",
            });
        }

        let regEx = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
        if (!regEx.test(req.body.email)) {
            return res.status(400).json({
                error: "Wrong email format",
            });
        }

        const { email } = req.body;

        const userToDelete = await User.findOne({ email: email });
        if (!userToDelete) {
            return res.status(400).json({
                error: "The provided email is not associated to any account",
            });
        }

        if (userToDelete.role === "Admin") {
            return res.status(400).json({
                error: "Cannot delete an admin",
            });
        }

        // save the username in order to delete the transactions
        const username = userToDelete.username;

        await User.deleteOne({ email: email });

        const toDelete = await transactions.find({
            username: username,
        });

        let deleted = 0;
        if (toDelete) {
            let deletedTransactions = await transactions.deleteMany({
                username: username,
            });
            deleted = deletedTransactions.deletedCount;
        }

        // Delete user from group
        const userGroup = await Group.findOne({
            members: { $elemMatch: { email: email } },
        });

        let deletedFromGroup;

        if (userGroup) {
            // user is in group, need to delete
            if (userGroup.members.length == 1) {
                await Group.deleteOne({ name: userGroup.name });
            } else {
                await Group.updateOne(
                    { name: userGroup.name },
                    { $pull: { members: { email: email } } }
                );
            }
            deletedFromGroup = true;
        } else {
            deletedFromGroup = false;
        }

        res.status(200).json({
            data: {
                deletedTransactions: deleted,
                deletedFromGroup: deletedFromGroup,
            },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a group
  - Request Parameters: None
- Request Body Content: A string equal to the `name` of the group to be deleted
  - Example: `{name: "Family"}`
- Response `data` Content: A message confirming successful deletion
  - Example: `res.status(200).json({data: {message: "Group deleted successfully"} , refreshedTokenMessage: res.locals.refreshedTokenMessage})`
- Returns a 400 error if the request body does not contain all the necessary attributes
- Returns a 400 error if the name passed in the request body is an empty string
- Returns a 400 error if the name passed in the request body does not represent a group in the database
- Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteGroup = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({
                error: adminAuth.cause,
            });
        }

        if (!req.body.hasOwnProperty("name")) {
            return res.status(400).json({
                error: " name property missing in the request body",
            });
        }

        if (req.body.name === "") {
            return res.status(400).json({
                error: "name cannot be empty",
            });
        }

        const { name } = req.body;

        const group = await Group.findOne({ name });
        if (!group) {
            return res.status(400).json({
                error: "The provided group does not exist",
            });
        }

        await Group.deleteOne({ name: name });

        res.status(200).json({
            data: { message: "Group deleted successfully" },
            refreshedTokenMessage: res.locals.refreshedTokenMessage,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
