import express from 'express'
import Card from '../models/Card.js';
import { creatNewCard, deleteCard, getAllCards, getCardById, updateCard } from '../services/cardsService.js';
import { auth } from '../../auth/services/authService.js';
import { getCardByIdFromDb } from '../services/cardsDataService.js';


const router = express.Router()


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