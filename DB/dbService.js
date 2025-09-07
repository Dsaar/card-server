import mongoose from "mongoose";
import config from "config";

export const connectToDb = () => {
	const dbEnv = config.get("DB_ENVIRONMENT");
	const connectionString =
		dbEnv === "local" ? process.env.LOCAL_DB : process.env.ATLAS_DB;
	const connectionMsg =
		dbEnv === "local"
			? "connected to MongoDb Locally!"
			: "connected to MongoDb Atlas!";
	mongoose
		.connect(connectionString)
		.then(() => console.log(connectionMsg))
		.catch((error) => console.log(`could not connect to mongoDb: ${error}`));
};