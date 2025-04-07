import express from 'express'
import { getMergedCalendar } from "../controllers/calendarController.js";

const router = express.Router()

router.get('/', getMergedCalendar)

export default router
