// seed/seed.js
import dotenv from "dotenv";
import config from "config";
import mongoose from "mongoose";

import User from "../users/models/User.js";
import Card from "../cards/models/Card.js";
import { generatePassword } from "../users/helpers/bcrypt.js";
import { generateBizNumber } from "../cards/helpers/generateBizNumber.js";
import { users } from "./data/userSeed.js";
import { cards } from "./data/cardSeed.js";

dotenv.config();
/* =========================================================================
   ENV GUARDS — dev-only by default (refuse in prod unless explicitly allowed)
   ========================================================================= */
const nodeEnv = process.env.NODE_ENV || "development";
const dbEnv =
	(config.has("DB_ENVIRONMENT") && config.get("DB_ENVIRONMENT")) || "local";

if ((nodeEnv === "production" || dbEnv !== "local") && !process.env.ALLOW_SEED_ANYWAY) {
	console.error(`❌ Refusing to seed. NODE_ENV=${nodeEnv}, DB_ENVIRONMENT=${dbEnv}.`);
	console.error("   This script seeds only development/local by default.");
	console.error("   Set ALLOW_SEED_ANYWAY=true to override (NOT recommended for prod).");
	process.exit(1);
}
/* =========================
   DB CONNECTION UTILITIES
   ========================= */
function pickMongoUri() {
	// 1) explicit override (best for one-off runs)
	if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

	// 2) mirror server logic (config -> LOCAL_DB / ATLAS_DB)
	return dbEnv === "local" ? process.env.LOCAL_DB : process.env.ATLAS_DB;
}

function maskUri(uri) {
	if (!uri) return uri;
	return uri.replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+@/, "$1****@");
}

function looksAtlas(uri) {
	return typeof uri === "string" && uri.startsWith("mongodb+srv://");
}

function warnIfAtlasMissingDbName(uri) {
	if (!uri) return;
	if (looksAtlas(uri) && !/mongodb\.net\/[^/?]+/i.test(uri)) {
		console.warn(
			"⚠️ ATLAS URI has no DB name; Mongo will default to 'test'. " +
			"Add '/business_card_app_prod' (or similar) to the URI if seeding Atlas intentionally."
		);
	}
}

async function connect() {
	const uri = pickMongoUri();
	if (!uri) {
		console.error("❌ No MongoDB URI. Set MONGODB_URI, or configure LOCAL_DB/ATLAS_DB + DB_ENVIRONMENT.");
		process.exit(1);
	}

	// Extra safety: by default, block seeding Atlas unless explicitly allowed
	if (looksAtlas(uri) && !process.env.ALLOW_SEED_ANYWAY) {
		console.error(`❌ Refusing to seed remote Atlas by default. URI=${maskUri(uri)}`);
		console.error("   Set ALLOW_SEED_ANYWAY=true if you really intend to seed Atlas.");
		process.exit(1);
	}

	warnIfAtlasMissingDbName(uri);
	console.log("Seeding: connecting to", maskUri(uri));
	await mongoose.connect(uri);
	const { name, host } = mongoose.connection;
	console.log(`✅ Connected for seed: db="${name}" host="${host}"`);
}

async function disconnect() {
	await mongoose.disconnect();
	console.log("👋 Seed: disconnected");
}
/* =========================
   DATA HELPERS (idempotent)
   ========================= */
async function upsertUser({
	email,
	password,
	name,
	phone,
	address,
	image,
	isBusiness = false,
	isAdmin = false,
}) {
	const normalizedEmail = String(email).trim().toLowerCase();
	const hashed = generatePassword(password);

	await User.updateOne(
		{ email: normalizedEmail },
		{
			$setOnInsert: {
				email: normalizedEmail,
				password: hashed,
				name,
				phone,
				address,
				image,
				isBusiness,
				isAdmin,
			},
		},
		{ upsert: true }
	);

	const user = await User.findOne({ email: normalizedEmail });
	console.log(
		`👤 User ready: ${user.email} (isBusiness=${user.isBusiness}, isAdmin=${user.isAdmin})`
	);
	return user;
}

async function uniqueBizNumber() {
	// Try multiple times to avoid rare collisions
	for (let i = 0; i < 20; i++) {
		const n = await generateBizNumber(); // expected 7-digit number
		const exists = await Card.findOne({ bizNumber: n });
		if (!exists) return n;
	}
	throw new Error("Failed to allocate a unique bizNumber after many tries");
}

async function upsertCardByTitle({
	title,
	subtitle,
	description,
	phone,
	email,
	web,
	image,
	address,
	ownerId,
}) {
	let card = await Card.findOne({ title });
	if (card) {
		console.log(`💳 Card exists: ${title}`);
		return card;
	}

	const bizNumber = await uniqueBizNumber();

	card = new Card({
		title,
		subtitle,
		description,
		phone,
		email,
		web,
		image,
		address,
		bizNumber,
		likes: [],
		user_id: String(ownerId), // your schema stores user_id as String
	});

	await card.save();
	console.log(`✅ Card created: ${title} (bizNumber=${bizNumber})`);
	return card;
}
/* =========================
   MAIN
   ========================= */
(async function main() {
	try {
		await connect();

		// --- USERS ---
		const userMap = {};
		for (const u of users) {
			const created = await upsertUser(u);
			userMap[u.key] = created;
		}

		// --- CARDS (owned by BUSINESS user) ---
			for (const c of cards) {
				const owner = userMap[c.ownerKey];
				if (!owner) {
					console.warn(`⚠️ Skipping card "${c.title}" — no owner with key "${c.ownerKey}"`);
					continue;
				}
				await upsertCardByTitle({ ...c, ownerId: owner._id });
			}

			console.log("🌱 Seeding complete.");
		} catch (err) {
			console.error("❌ Seed failed:", err);
			process.exitCode = 1;
		} finally {
			await disconnect();
		}
	}) ();