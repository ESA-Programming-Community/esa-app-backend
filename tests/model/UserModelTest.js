import {getUser} from "../../model/UserModel.js";

// tests for the user model will be conducted here

/**
 * Testing getUser method. It should return a list of
 * objects or an empty list if no user ID matches
 * @type {*}
 */
const user = await getUser(58);
console.log(user);