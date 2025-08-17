import { validateCard } from "../validation/cardValidationService.js";
import { createCardInDb, deleteCardInDb, getAllCardsFromDb, getCardByIdFromDb, updateCardInDb } from "./cardsDataService.js"


//get all
export const getAllCards = async () => {
	const cards = await getAllCardsFromDb();
	return cards;
};

//get one by id
export const getCardById = async (id) => {
	const card = await getCardByIdFromDb(id);
	return card;
};

//create
export const creatNewCard = async (card, userId) => {
	//generate biznumnber for the card
	//it will look like this
	//card.bizNumber=generateBiznumber()
	card.user_id = userId;
	const { error } = validateCard(card)
	if (error) {
		console.log(error.details[0].message)
		return null
	}
	const newCard = await createCardInDb(card);
	return newCard;
};
//update
export const updateCard = async (id, newCard) => {
	const modifiedCard = await updateCardInDb(id, newCard);
	const { error } = validateCard(newCard)
	if (error) {
		console.log(error.details[0].message)
		return null
	}
	return modifiedCard;
};
//delete
export const deleteCard = async (id) => {
	const idOfDeletedCard = await deleteCardInDb(id);
	return idOfDeletedCard;
};

//toggleLike


//changeBizNumber