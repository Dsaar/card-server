import { createCardInDb, deleteCardInDb, getAllCardsFromDb, getCardByIdFromDb, updateCardInDb } from "./cardsDataService.js"


//get all
export const getAllCards = async () => {
	const cards = await getAllCardsFromDb();
	return cards;
}

//get one by id
export const getCardById = async (id) => {
	const card = await getCardByIdFromDb(id);
	return card;
};

//create
export const creatNewCard = async (card) => {
	//generate biznumnber for the card
	//it will look like this
	//card.bizNumber=generateBiznumber()
	const newCard = await createCardInDb(card);
	return newCard;
}
//update
export const updateCard = async (id, newCard) => {
	const modifiedCard = await updateCardInDb(id, newCard);
	return modifiedCard;
}
//delete
export const deleteCard = async (id) => {
	const idOfDeletedCard = await deleteCardInDb(id);
	return idOfDeletedCard;
};

//toggleLike


//changeBizNumber