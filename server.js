import express from 'express'
import logger from './middlewares/logger.js';
import router from './router/router.js';
import cors from 'cors';
import { connectToDb } from './DB/dbService.js';
import chalk from 'chalk';

const app = express();
const port = 3000;

app.use(cors({

	origin: ["http://127.0.0.1:5500"],

}));

app.use(express.json());
app.use(logger);

app.use(express.static("./public"));


app.get('/ping', (req, res) => {
	res.send('pong')
});

app.use(router);


app.use((error, req, res, next) => {
	console.log(error);
	res.status(500).send("Server Internal Error");
});

app.listen(port, () => {
	console.log(chalk.blueBright(`Example app listening on port ${port}`));
	connectToDb();
});