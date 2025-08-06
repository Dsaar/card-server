import { createUser, getUserByEmail } from "./usersDataService.js";


//create
export const creatNewUser = async (user) => {

	const newUser = await createUser(user);
	return newUser;
}

//log in
export const login = async (email, password) => {
	const user = await getUserByEmail(email)
	if (user?.password === password) {
		return "TOKEN TOKEN TOKEN"
	}
	return null;
};

