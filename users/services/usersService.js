import { generateToken } from "../../auth/providers/jwtProvider.js";
import { comparePassword, generatePassword } from "../helpers/bcrypt.js";
import { createUser, getUserByEmail } from "./usersDataService.js";


//create
export const creatNewUser = async (user) => {
	user.password = generatePassword(user.password)
	const newUser = await createUser(user);
	return newUser;
}

//log in
export const login = async (email, password) => {
	const user = await getUserByEmail(email)
	if (comparePassword(password,user?.password)) {
		return generateToken(user)
	}
	return null;
};

