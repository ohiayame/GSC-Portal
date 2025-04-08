// controllers/calendarController.js
import { fetchCalendarEvents, fetchHolidayEvents } from '../utils/googleCalendar.js';

export async function getMergedCalendar(req, res) {
  const { timeMin, timeMax } = req.query;

  const [mainEvents, holidayEvents] = await Promise.all([
    fetchCalendarEvents(timeMin, timeMax),
    fetchHolidayEvents(timeMin, timeMax)
  ]);

  const combined = [];

  // 1️⃣ 학과 보강/휴강 일정 정리
  for (const e of mainEvents) {
    if (!e.start?.dateTime) continue;
    combined.push({
      type:
        e.summary.includes('보강') ? '보강' :
        e.summary.includes('휴강') ? '휴강' :
        '기타',
      title: e.summary,
      time: new Date(e.start.dateTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      date: e.start.dateTime.slice(0, 10),
    });
  }

  // 2️⃣ 공휴일 일정 추가
  for (const e of holidayEvents) {
    if (!e.start?.date) continue;
    combined.push({
      type: '공휴일',
      title: e.summary,
      time: '',
      date: e.start.date,
    });
  }

  combined.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  res.json(combined);
}
