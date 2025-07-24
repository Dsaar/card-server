import express from 'express'
import cardController from '../cards/routes/cardsController.js'


const router = express.Router()

router.use('/cards', cardController)

export default router
