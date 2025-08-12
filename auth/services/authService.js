import { verifyToken } from "../providers/jwtProvider.js";

export const auth = (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token) {
		return res.status(401).send("Authentication Error: Please Login");
	}
	const userInfo = verifyToken(token)
	if (!userInfo) {
		return res.status(401).send("Authentication Error: Unauthorize User");

	}
	req.user=userInfo;
	next();
};