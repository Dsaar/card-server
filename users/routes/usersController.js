import express from 'express'
import { createNewUser, login, updateUser } from '../services/usersService.js'
import { requireAdmin } from '../../auth/middlewares/requireAdmin.js';
import { auth } from '../../auth/services/authService.js';
import { deleteUserInDb, getAllUsersFromDb, getUserByIdFromDb } from '../services/usersDataService.js';
import mongoose from 'mongoose';

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

/** REVOKE BUSINESS (admin only) */                     
router.patch("/:id", auth, requireAdmin, async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send("Invalid user id");
	}

	// Load current to know what to toggle from
	const current = await getUserByIdFromDb(id);
	if (!current) return res.status(404).send("User not found");

	// Determine target value
	const hasExplicit =
		req.body &&
		Object.prototype.hasOwnProperty.call(req.body, "isBusiness") &&
		typeof req.body.isBusiness === "boolean";

	const nextIsBusiness = hasExplicit ? !!req.body.isBusiness : !current.isBusiness;

	try {
		const updated = await updateUser(
			id,
			{ isBusiness: nextIsBusiness },
			{ isAdminCaller: true } // allow admin to change this field
		);
		if (!updated) return res.status(404).send("User not found");

		res.send({
			message: nextIsBusiness ? "Business status granted" : "Business status revoked",
			id: updated._id,
			isBusiness: updated.isBusiness,
		});
	} catch (e) {
		res.status(400).send(e.message || "Failed to update user");
	}
});

/** DELETE USER (admin only) */                          
router.delete("/:id", auth, requireAdmin, async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send("Invalid user id");
	const existing = await getUserByIdFromDb(id);
	if (!existing) return res.status(404).send("User not found");
	await deleteUserInDb(id);
	res.send({ message: "User deleted", id });
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