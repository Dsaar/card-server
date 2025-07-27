import express from 'express'
import Card from '../models/Card.js';
import { creatNewCard } from '../services/cardsService.js';


const router = express.Router()

let cards = [
	{ id: 1, title: 'card1', subtitle: 'sub card1', likes: [] },
	{ id: 2, title: 'card2', subtitle: 'sub card2', likes: [] },
	{ id: 3, title: 'card3', subtitle: 'sub card3', likes: [] },
];


//read
router.get('/', async (req, res) => {
	const cardFromDb = await Card.find();
	res.send(cardFromDb);
});

//create
router.post("/", async (req, res) => {
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
	const cardFromDb = await Card.findById(id);
	if (cardFromDb) {
		res.send(cardFromDb)

	} else {
		res.status(404).send('Card not found')
	}
});



//update
router.put("/:id", (req, res) => {

	const { id } = req.params;

	const newCard = req.body;


	const cardToReplaceIndex = cards.findIndex(

		(card) => card.id.toString() === id

	);

	if (cardToReplaceIndex !== -1) {

		cards[cardToReplaceIndex] = newCard;

	}

	res.send(cards);

});

//delete
router.delete('/:id', (req, res) => {
	const { id } = req.params;
	cards = cards.filter((card) => card.id.toString() !== id)
	res.send(cards)
});

export default router