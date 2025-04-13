import express from 'express'
import { refreshAccessToken  } from "../controllers/usersController.js";

const router = express.Router()

router.post('/', refreshAccessToken )

export default router
