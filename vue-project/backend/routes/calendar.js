import express from 'express'
import { fetchCalendarEvents } from '../utils/googleCalendar.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const { timeMin, timeMax  } = req.query

  try {
    const events = await fetchCalendarEvents(timeMin, timeMax)
    res.json(events)
  } catch (err) {
    console.error('📛 캘린더 로드 오류:', err)
    res.status(500).json({ error: 'Failed to fetch calendar events' })
  }
})

export default router
