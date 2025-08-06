import express from 'express'
import cardController from '../cards/routes/cardsController.js'
import usersController from '../users/routes/usersController.js'


const router = express.Router()

router.use('/cards', cardController)
router.use('/users',usersController)

export default router
