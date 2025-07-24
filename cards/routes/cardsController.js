import express from 'express'

const router = express.Router()

let cards = [
	{ id: 1, title: 'card1', subtitle: 'sub card1', likes: [] },
	{ id: 2, title: 'card2', subtitle: 'sub card2', likes: [] },
	{ id: 3, title: 'card3', subtitle: 'sub card3', likes: [] },
];


//read
router.get('/', (req, res) => {
	res.send(cards)
});

//create
router.post("/", (req, res) => {

	const newCard = {
		id: cards.length + 1,
		...req.body
	};
	cards.push(newCard)
	res.status(201).send('New Card added succesfully')


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
router.get('/:id', (req, res) => {
	const { id } = req.params;
	const card = cards.find((c) => c.id.toString() === id)
	if (card) {
		res.send(card)

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