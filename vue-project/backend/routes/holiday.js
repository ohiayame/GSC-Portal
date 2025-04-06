// routes/holiday.js
import express from 'express';
import { getHolidays } from '../utils/holidayApi.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: 'year와 month 쿼리가 필요합니다' });
  }

  try {
    const data = await getHolidays(year, month);
    console.log("📅 공휴일 데이터:", data);
    res.json(data);
  } catch (error) {
    console.error("공휴일 API 오류:", error);
    res.status(500).json({ error: '공휴일 정보를 가져오지 못했습니다.' });
  }
});

export default router;
