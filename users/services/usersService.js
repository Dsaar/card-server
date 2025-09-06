import _ from "lodash";
import { generateToken } from "../../auth/providers/jwtProvider.js";
import { comparePassword, generatePassword } from "../helpers/bcrypt.js";
import { createUser, getUserByEmail, updateUserInDb } from "./usersDataService.js";
import { validateUser } from "../validation/userValidationService.js";

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

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


//log in with 24 block
export const login = async (email, password) => {
	try {
		// throws if email not found (your getUserByEmail already does that)
		const user = await getUserByEmail(email);

		const now = new Date();

		// still locked?
		if (user.blockedUntil && user.blockedUntil > now) {
			const err = new Error(
				`Account locked. Try again after ${user.blockedUntil.toISOString()}`
			);
			err.code = "ACCOUNT_LOCKED";
			throw err;
		}

		// lock expired? reset counters
		if (user.blockedUntil && user.blockedUntil <= now) {
			user.blockedUntil = null;
			user.loginAttempts = 0;
			await user.save();
		}

		// check password
		const ok = comparePassword(password, user?.password);
		if (ok) {
			// success -> reset any counters/lock
			if (user.loginAttempts || user.blockedUntil) {
				user.loginAttempts = 0;
				user.blockedUntil = null;
				await user.save();
			}
			return generateToken(user);
		}

		// wrong password -> increment attempts
		user.loginAttempts = (user.loginAttempts || 0) + 1;

		if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
			user.blockedUntil = new Date(Date.now() + LOCK_TIME_MS);
			user.loginAttempts = 0; // reset after we lock
			await user.save();

			const err = new Error("Account locked for 24 hours due to multiple failed logins.");
			err.code = "ACCOUNT_LOCKED";
			throw err;
		}

		await user.save();
		throw new Error("password incorrect");
	} catch (error) {
		if (error.code === "ACCOUNT_LOCKED") throw error;
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

	// Do not allow tampering with lock fields via the API
	delete updates.loginAttempts;
	delete updates.blockedUntil;

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
