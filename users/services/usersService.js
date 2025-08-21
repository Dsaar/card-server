import _ from "lodash";
import { generateToken } from "../../auth/providers/jwtProvider.js";
import { comparePassword, generatePassword } from "../helpers/bcrypt.js";
import { createUser, getUserByEmail } from "./usersDataService.js";
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

