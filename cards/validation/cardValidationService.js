import cardSchema from "./cardValidationSchema.js"

export const validateCard=(card)=>{
	return cardSchema.validate(card);
};
