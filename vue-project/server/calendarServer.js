import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI
);

// 📌 Google Calendar OAuth 인증 URL 생성
app.get('/calendar/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });
  res.json({ url: authUrl });
});

// 📌 OAuth 인증 후 access_token 저장
app.post('/calendar/auth/callback', async (req, res) => {
  const { code } = req.body;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.json({ success: true, tokens });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 📌 Google Calendar 일정 추가
app.post('/calendar/add-event', async (req, res) => {
  const { accessToken, summary, start, end } = req.body;
  if (!accessToken) {
    return res.status(401).json({ success: false, message: 'OAuth 인증 필요' });
  }

  oauth2Client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: { summary, start: { dateTime: start, timeZone: 'Asia/Seoul' }, end: { dateTime: end, timeZone: 'Asia/Seoul' } },
    });
    res.json({ success: true, event: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`✅ 캘린더 서버 실행 중: http://localhost:${PORT}`));
