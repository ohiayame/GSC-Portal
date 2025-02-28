import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/users.js'; // 확장자를 명시해야 함
import noticesRouter from './routes/notices.js'; // 공지사항 추가

// console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

console.log("🔍 authRoutes:", authRoutes);
app.use('/auth', authRoutes);
app.use('/api/notices', noticesRouter);

const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  console.log(`🔍 ${req.method} 요청 → ${req.url}`);
  console.log("🔍 요청 헤더:", req.headers);
  console.log("🔍 요청 쿠키:", req.cookies);
  next();
});


app.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
