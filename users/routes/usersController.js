import express from 'express'
import { createNewUser, login, updateUser } from '../services/usersService.js'
import { requireAdmin } from '../../auth/middlewares/requireAdmin.js';
import { auth } from '../../auth/services/authService.js';
import { getAllUsersFromDb, getUserByIdFromDb } from '../services/usersDataService.js';

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
	try {
		const { password, email } = req.body;
		const token = await login(email, password);
		res.send(token);
	} catch (error) {
		res.status(401).send("invalid email or password");
	}
});


/** GET MY PROFILE (auth) */
router.get("/me", auth, async (req, res) => {
	const me = await getUserByIdFromDb(req.user._id);
	if (!me) return res.status(404).send("User not found");
	res.send(me);
});

/** LIST USERS (admin only) */
router.get("/", auth, requireAdmin, async (_req, res) => {
	const users = await getAllUsersFromDb();
	res.send(users || []);
});


/** UPDATE USER (self or admin) */
router.put("/:id", auth, async (req, res) => {
	try {
		const { id } = req.params;

		// only self or admin can edit
		if (req.user._id !== id && !req.user.isAdmin) {
			return res.status(403).send("Forbidden");
		}

		const updated = await updateUser(id, req.body, { isAdminCaller: !!req.user.isAdmin });
		if (!updated) return res.status(404).send("User not found");
		res.send(updated);
	} catch (error) {
		res.status(400).send(error.message || "Failed to update user");
	}
});

// GET BY ID (self or admin)
router.get("/:id", auth, async (req, res) => {
	const { id } = req.params;
	if (req.user._id !== id && !req.user.isAdmin) {
		return res.status(403).send("Forbidden");
	}
	const user = await getUserByIdFromDb(id);
	if (!user) return res.status(404).send("User not found");
	res.send(user);
});

export default router