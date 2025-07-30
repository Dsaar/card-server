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
