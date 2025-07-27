import { model, Schema } from "mongoose";
import {
	DEFAULT_VALIDATION,
	EMAIL,
	PHONE,
	URL,
} from "../../helpers/mongooseValidators.js";
import { Address } from "../../helpers/submodels/Address.js";
import { Image } from "../../helpers/submodels/Image.js";

const cardSchema = new Schema({
	title: DEFAULT_VALIDATION,
	subtitle: DEFAULT_VALIDATION,
	description: {
		...DEFAULT_VALIDATION,
		maxLength: 1024,
	},
	phone: PHONE,
	email: EMAIL,
	web: URL,
	image: Image,
	address: Address,
	bizNumber: {
		type: Number,
		minLength: 7,
		maxLength: 7,
		required: true,
		trim: true,
	},
	likes: [String],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	user_id: {
		type: String,
		required: true,
	},
});

const Card = model("card", cardSchema);

export default Card;