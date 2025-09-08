// seed/seed.js
import dotenv from "dotenv";
import config from "config";
import mongoose from "mongoose";

// ⬇️ Adjust paths if your folders differ
import User from "../users/models/User.js";
import Card from "../cards/models/Card.js";
import { generatePassword } from "../users/helpers/bcrypt.js";
import { generateBizNumber } from "../cards/helpers/generateBizNumber.js";

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
		const regular = await upsertUser({
			email: "regular@example.com",
			password: "User123!",
			name: { first: "Reg", last: "User" },
			phone: "050-1234567",
			address: {
				country: "Israel",
				city: "Tel Aviv",
				street: "Herzl",
				houseNumber: 1,
				zip: 12345,
			},
			image: { url: "https://picsum.photos/seed/regular/300/200", alt: "regular user" },
			isBusiness: false,
			isAdmin: false,
		});

		const business = await upsertUser({
			email: "business@example.com",
			password: "Biz123!",
			name: { first: "Biz", last: "Owner" },
			phone: "052-2345678",
			address: {
				country: "Israel",
				city: "Jerusalem",
				street: "Jabotinsky",
				houseNumber: 10,
				zip: 23456,
			},
			image: { url: "https://picsum.photos/seed/business/300/200", alt: "business user" },
			isBusiness: true,
			isAdmin: false,
		});

		const admin = await upsertUser({
			email: "admin@example.com",
			password: "Admin123!",
			name: { first: "Admin", last: "User" },
			phone: "053-3456789",
			address: {
				country: "Israel",
				city: "Haifa",
				street: "Ben Gurion",
				houseNumber: 5,
				zip: 34567,
			},
			image: { url: "https://picsum.photos/seed/admin/300/200", alt: "admin user" },
			isBusiness: true,
			isAdmin: true,
		});

		// --- CARDS (owned by BUSINESS user) ---
		await upsertCardByTitle({
			title: "Coffee Corner",
			subtitle: "Fresh Roasts Daily",
			description: "Your friendly neighborhood coffee shop.\nTry our house blend!",
			phone: "03-5551234",
			email: "contact@coffeecorner.com",
			web: "https://coffeecorner.example.com",
			image: {
				url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
				alt: "coffee shop",
			},
			address: {
				state: "IL",
				country: "Israel",
				city: "Tel Aviv",
				street: "Dizengoff",
				houseNumber: 101,
				zip: 61000,
			},
			ownerId: business._id,
		});

		await upsertCardByTitle({
			title: "TechFix",
			subtitle: "We Repair Your Tech",
			description: "Phone and laptop repairs. Fast turnaround.",
			phone: "02-7778888",
			email: "support@techfix.io",
			web: "https://techfix.example.com",
			image: {
				url: "https://picsum.photos/seed/techfix/1200/800",
				alt: "tech repair",
			},
			address: {
				state: "IL",
				country: "Israel",
				city: "Jerusalem",
				street: "King George",
				houseNumber: 22,
				zip: 94500,
			},
			ownerId: business._id,
		});

		await upsertCardByTitle({
			title: "Green Grocer",
			subtitle: "Organic & Local Produce",
			description: "Fresh veggies and fruits delivered daily.",
			phone: "04-6123456",
			email: "hello@greengrocer.co.il",
			web: "https://greengrocer.example.com",
			image: {
				url: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=1200&auto=format&fit=crop",
				alt: "grocery store",
			},
			address: {
				state: "IL",
				country: "Israel",
				city: "Haifa",
				street: "Hertzel",
				houseNumber: 7,
				zip: 33000,
			},
			ownerId: business._id,
		});

		console.log("🌱 Seeding complete.");
	} catch (err) {
		console.error("❌ Seed failed:", err);
		process.exitCode = 1;
	} finally {
		await disconnect();
	}
})();
