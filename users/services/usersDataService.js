import User from "../models/User.js";


//get all
export const getAllUsersFromDb = async () => {
	try {
		const users = await User.find();
		return users;
	} catch (error) {
		console.log(error);
		return null;
	}
};

//get one by id
export const getUserByIdFromDb = async (id) => {
	try {
		const user = await User.findById(id);
		return user;
	} catch (error) {
		console.log(error);
		return null;
	}
};

//create
export const createUser = async (user) => {
	try {
		const userForDb = new User(user);
		await userForDb.save();
		return userForDb;
	} catch (error) {
		console.log(error);

		// 1️⃣ Duplicate key (email already used)
		if (error.code === 11000 && error.keyPattern?.email) {
			throw new Error("Email is already in use. Please choose another one.");
		}

		// 2️⃣ Validation error (info not good / schema rules violated)
		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map((e) => e.message);
			throw new Error(`Validation failed: ${messages.join(", ")}`);
		}


		// 3️⃣ Any other MongoDB / network issue
		throw new Error("MongoDb - Error in creating new user");
	}
};


//update -> gets id and new card and return new card
export const updateUserInDb = async (id, newUser) => {
	try {
		const userAfterUpdate = await User.findByIdAndUpdate(id, newUser, {
			new: true,
		});
		return userAfterUpdate;
	} catch (error) {
		console.log(error);
		return null;
	}
};

//delete -> gets id and return id
export const deleteUserInDb = async (id) => {
	try {
		await User.findByIdAndDelete(id);
		return id;
	} catch (error) {
		console.log(error);
		return null;
	}
};

//get user by email
export const getUserByEmail = async (email) => {
	try {
		const user = await User.findOne({ email });
		return user;
	} catch (error) {
		console.log(error);
		return null;
	}
};