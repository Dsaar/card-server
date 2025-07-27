import Card from "../models/Card.js"


//get all



//get one by id

//get all

//create
export const creatCard = async (card) => {
	try{
		const cardForDb = new Card(card);
		await cardForDb.save();
		return cardForDb;
	}catch(error){
		console.log(error)
		return null
	}

};
//update

//delete