import express from 'express'
import { createNewUser, login } from '../services/usersService.js'

const router = express.Router()

//sign up
router.post("/", async (req, res) => {
	try {
		const newUser = req.body;
		const user = await createNewUser(newUser);
		res.status(201).send(user);
	} catch (error) {
		res.status(400).send(error.message);
	}
});


//log in
router.post("/login", async (req, res) => {
	const { password, email } = req.body;
	const token = await login(email, password);
	if (token) {
		res.send(token);
	} else {
		res.status(401).send("invalid email or password");
	}
});



export default router