// utils/googleCalendar.js
import { google } from 'googleapis';
import path from 'path';

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), 'config/calendar-key.json'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

export async function insertEvent({ summary, location, startDateTime, endDateTime }) {
  const client = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: client });

  const calendarId = '8d2bbe23e70bb5961d50ac7d654080b75227e5a8b2cf2d5915bd5405c45117ec@group.calendar.google.com'; // ✅ 본인의 캘린더 ID

  const event = {
    summary,
    location,
    start: {
      dateTime: startDateTime,
      timeZone: 'Asia/Seoul',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Asia/Seoul',
    },
  };

  const response = await calendar.events.insert({
    calendarId,
    resource: event,
  });

  return response.data;
}
