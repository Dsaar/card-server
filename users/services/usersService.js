import _ from "lodash";
import { generateToken } from "../../auth/providers/jwtProvider.js";
import { comparePassword, generatePassword } from "../helpers/bcrypt.js";
import { createUser, getUserByEmail, updateUserInDb } from "./usersDataService.js";
import { validateUser } from "../validation/userValidationService.js";


//create
export const createNewUser = async (user) => {
	//validation
	try {
		const { error } = validateUser(user);
		if (error) {
			console.log(error.details[0].message);
			throw new Error(error.details[0].message);
		}

		//hashing password after validation
		let hashPass = generatePassword(user.password);
		user.password = hashPass;


		//create user in DB
		const newUser = await createUser(user);

		//sending select info of user 
		const DTOuser = _.pick(newUser, ["email", "name", "_id"])
		return DTOuser;

	} catch (error) {
		throw new Error(error.message);
	}
};


//log in
export const login = async (email, password) => {
	try {
		const user = await getUserByEmail(email);
		if (comparePassword(password, user?.password)) {
			return generateToken(user);
		}
		throw new Error("password incorrect");
	} catch (error) {
		throw new Error(error.message);
	}
};



/** update (self or admin) */
export const updateUser = async (id, updates, { isAdminCaller }) => {
	// Never allow client to change _id
	delete updates._id;

	// Only admins can change isAdmin
	if (!isAdminCaller) {
		delete updates.isAdmin;
	}

	// Hash password if provided
	if (updates.password) {
		updates.password = generatePassword(updates.password);
	}

	// Optionally: whitelist fields to reduce risk
	// const allowed = ["name","email","phone","image","address","isBusiness","isAdmin","password"];
	// updates = _.pick(updates, allowed);

	const updated = await updateUserInDb(id, updates);
	return updated; // already sanitized in data layer
};
