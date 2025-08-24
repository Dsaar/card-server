import _ from "lodash";
import { getCardByBizNumber } from "../services/cardsDataService.js";

export const generateBizNumber = async () => {
	let newBizNumber;
	let isCardWithThisBizNumExists;

	do {
		newBizNumber = _.random(1000000, 9999999);
		isCardWithThisBizNumExists = await getCardByBizNumber(newBizNumber);
	} while (isCardWithThisBizNumExists);

	return newBizNumber;
};