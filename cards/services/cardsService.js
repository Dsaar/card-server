import { generateBizNumber } from "../helpers/generateBizNumber.js";
import { validateCard } from "../validation/cardValidationService.js";
import { changeBizNumberInDb, createCardInDb, deleteCardInDb, getAllCardsFromDb, getCardByBizNumber, getCardByIdFromDb, getLikedCardsFromDb, toggleLikeInDb, updateCardInDb } from "./cardsDataService.js"


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
	card.bizNumber = await generateBizNumber()
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
// liked cards (current user)
export const getLikedCards = async (userId) => {
	return await getLikedCardsFromDb(userId);
};

// like/unlike toggle
export const toggleLike = async (cardId, userId) => {
	return await toggleLikeInDb(cardId, userId);
};

//changeBizNumber
export const changeBizNumber = async (id, newBizNumber) => {
	const existing = await getCardByIdFromDb(id);
	if (!existing) return null;

	// Try up to 20 times to avoid rare collisions
	for (let i = 0; i < 20; i++) {
		const n = await generateBizNumber(); // expected to return 7-digit number
		if (n === existing.bizNumber) continue;
		const taken = await getCardByBizNumber(n);
		if (!taken) {
			return await changeBizNumberInDb(id, n); // update & return updated doc
		}
	}
	return null; // failed to allocate (extremely unlikely)
};