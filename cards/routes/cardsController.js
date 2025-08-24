import express from 'express'
import Card from '../models/Card.js';
import { creatNewCard, deleteCard, getAllCards, getCardById, getLikedCards, toggleLike, updateCard } from '../services/cardsService.js';
import { auth } from '../../auth/services/authService.js';
import { getCardByIdFromDb } from '../services/cardsDataService.js';
import mongoose from 'mongoose';


const router = express.Router()


//read
router.get("/", async (_req, res) => {
	const allCards = await getAllCards();
	console.log("GET /cards ->", allCards?.length ?? 0);
	return allCards
		? res.send(allCards)
		: res.status(500).send("something went wrong with get all cards");
});

//create
router.post("/", auth, async (req, res) => {
	const newCard = req.body;
	const user = req.user

	if (!user.isBusiness) {
		return res.status(403).send("Only Business user can create cards");
	}

	const cardResult = await creatNewCard(newCard, user._id);
	
	if (cardResult) {
		res.status(201).send("New card added successfully");
	} else {
		res.status(400).send("something went wrong with card creation");
	}
});


//my cards
router.get("/my-cards", auth, async (req, res) => {
	const mine = await Card.find({ user_id: req.user._id });
	res.send(mine || []);
});

// LIKED CARDS (current user)
router.get("/liked", auth, async (req, res) => {
	const liked = await getLikedCards(req.user._id);
	res.send(liked || []);
});

// LIKE/UNLIKE (new-style): PATCH /cards/:id/like -> meta response
router.patch("/:id/like", auth, async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send("Invalid card id");
	}
	const card = await toggleLike(id, req.user._id);
	if (!card) return res.status(404).send("Card not found");

	const liked = card.likes.includes(req.user._id);
	res.send({ cardId: card._id, liked, likesCount: card.likes.length });
});

// ✅ BACK-COMPAT for your existing frontend:
// PATCH /cards/:id -> toggle like and return the FULL updated card
router.patch("/:id", auth, async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send("Invalid card id");
	}
	const card = await toggleLike(id, req.user._id);
	if (!card) return res.status(404).send("Card not found");
	res.send(card);
});

//get one by id
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const card = await getCardById(id);
	if (card) {
		res.send(card)

	} else {
		res.status(404).send('Card not found')
	}
});



//update
router.put("/:id", auth, async (req, res) => {
	const { id } = req.params;
	const newCard = req.body;
	const modifiedCard = await updateCard(id, newCard);
	if (modifiedCard) {
		res.send(modifiedCard);
	} else {
		res.status(400).send("something went wrong with card edit");
	}
});

//delete
router.delete("/:id", auth, async (req, res) => {
	const { id } = req.params;
	const user = req.user
	const card = await getCardByIdFromDb(id)

	if (!user.isAdmin && card.user_id !== user._id) {
		return res.status(403).send("Only Admin user or owner of card can delete it")
	}

	const idOfDeletedCard = await deleteCard(id);
	if (idOfDeletedCard) {
		res.send("Card deleted successfully");
	} else {
		res.status(400).send("something went wrong with card delete");
	}
});




export default router