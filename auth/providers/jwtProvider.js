import jwt from "jsonwebtoken";

const secretWord = "2n3i8h2d239ruj23";

export const generateToken = (user) => {
	const token = jwt.sign(
		{
			_id: user._id,
			isBusiness: user.isBusiness,
			isAdmin: user.isAdmin,
		},
		secretWord
	);
	return token;
};

export const verifyToken = (tokenFromClient) => {
	try {
		const userDataFromPayload = jwt.verify(tokenFromClient, secretWord);
		return userDataFromPayload;
	} catch (error) {
		return null;
	}
};