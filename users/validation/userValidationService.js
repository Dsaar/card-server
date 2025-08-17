import signupSchema from "./userValidationSchema.js"

export const validateUser=(user)=>{
	return signupSchema.validate(user)
};