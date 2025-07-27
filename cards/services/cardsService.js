import { creatCard } from "./cardsDataService.js"


//get all







//get one by id

//get all

//create
export const creatNewCard = async (card) => {
	//generate biznumnber for the card
	//it will look like this
	//card.bizNumber=generateBiznumber()
	const newCard = await creatCard(card);
	return newCard;
}
//update

//delete

//toggleLike


//changeBizNumber