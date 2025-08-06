import express from 'express'
import Card from '../models/Card.js';
import { creatNewCard, deleteCard, getAllCards, getCardById, updateCard } from '../services/cardsService.js';
import { auth } from '../../auth/services/authService.js';


const router = express.Router()

let cards = [
	{ id: 1, title: 'card1', subtitle: 'sub card1', likes: [] },
	{ id: 2, title: 'card2', subtitle: 'sub card2', likes: [] },
	{ id: 3, title: 'card3', subtitle: 'sub card3', likes: [] },
];


//read
router.get("/", async (req, res) => {
	const allCards = await getAllCards();
	if (allCards) {
		res.send(allCards);
	} else {
		res.status(500).send("something went wrong with get all cards");
	}
});

//create
router.post("/", auth, async (req, res) => {
	const newCard = req.body;
	const cardResult = await creatNewCard(newCard);
	if (cardResult) {
		res.status(201).send("New card added successfully");
	} else {
		res.status(400).send("something went wrong with card creation");
	}
});

router.post("/like", (req, res) => {
	const { cardId, userId } = req.query;
	const cardIdNumber = Number(cardId); // convert from string

	if (!cardIdNumber || !userId) {
		return res.status(400).send("cardId and userId are required");
	}

	const card = cards.find(card => card.id === cardIdNumber);

	if (!card) {
		return res.status(404).send(`Card with id ${cardId} not found`);
	}

	if (card.likes.includes(userId)) {
		return res.status(409).send("User already liked this card");
	}

	card.likes.push(userId);
	res.send(`User ${userId} liked card ${cardId}`);
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
	const { id } = req.params;
	const idOfDeletedCard = await deleteCard(id);
	if (idOfDeletedCard) {
		res.send("Card deleted successfully");
	} else {
		res.status(400).send("something went wrong with card delete");
	}
});


export default router