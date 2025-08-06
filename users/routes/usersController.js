import express from 'express'
import { creatNewUser, login } from '../services/usersService.js'

const router = express.Router()

//sign up
router.post("/", async (req, res) => {
	const newUser = req.body
	const user = await creatNewUser(newUser)
	if (user) {
		res.status(201).send(user)
	} else {
		res.status(400).send("something went wrong with registration")
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