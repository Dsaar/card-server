import Card from "../models/Card.js"


//get all
export const getAllCardsFromDb = async () => {
	try {
		const cardFromDb = await Card.find()
		return cardFromDb;
	} catch (error) {
		console.log(error)
		return null
	}
};


//get one by id
export const getCardByIdFromDb = async (id) => {
	try {
		const cardFromDb = await Card.findById(id)
		return cardFromDb
	} catch (error) {
		console.log(error)
		return null
	}
}


//create
export const createCardInDb = async (card) => {
	try {
		const cardForDb = new Card(card);
		await cardForDb.save();
		return cardForDb;
	} catch (error) {
		console.log(error)
		return null
	}

};


//update
export const updateCardInDb = async (id, newCard) => {
	try {
		const cardAfterUpdate = await Card.findByIdAndUpdate(id, newCard, {
			new: true,
		});
		return cardAfterUpdate;
	} catch (error) {
		console.log(error);
		return null;
	}
};


//delete
export const deleteCardInDb = async (id) => {
	try {
		await Card.findByIdAndDelete(id)
		return id;
	} catch (error) {
		console.log(error)
		return null
	}

}

//get card by biz number
export const getCardByBizNumber = async (bizNumber) => {
	try {
		const card = await Card.findOne({ bizNumber });
		return card;
	} catch (error) {
		console.log(error);
		return null;
	}
};

// ===== LIKES =====

// list of cards liked by this user
export const getLikedCardsFromDb = async (userId) => {
	try {
		return await Card.find({ likes: userId });
	} catch (error) {
		console.log(error);
		return null;
	}
};

// toggle like/unlike (simple, compatible)
export const toggleLikeInDb = async (cardId, userId) => {
	try {
		const card = await Card.findById(cardId);
		if (!card) return null;

		const i = card.likes.indexOf(userId);
		if (i === -1) {
			card.likes.push(userId); // like
		} else {
			card.likes.splice(i, 1); // unlike
		}
		await card.save();
		return card;
	} catch (error) {
		console.log(error);
		return null;
	}
};

//admin: change bizNumber

export const changeBizNumberInDb = async (id, newBizNumber) => {
	try {
		const updated = await Card.findByIdAndUpdate(
			id,
			{ bizNumber: newBizNumber },
			{ new: true }
		);
		return updated;
	} catch (error) {
		console.log(error);
		return null;
	}
};