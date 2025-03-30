import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/users.js'; // 사용자 인증 라우트
import noticesRouter from './routes/notices.js'; // 공지사항 라우트
import timetableRouter from './routes/timetable.js'; // ✅ 시간표 라우트 추가
import specialSessionsRouter from './routes/specialSessions.js'; // ✅ 휴·보강 라우트 추가
import coursesRouter from "./routes/courses.js";
import assignLevelRoutes from "./routes/assignLevel.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

console.log("🔍 authRoutes:", authRoutes);
app.use('/auth', authRoutes);
app.use('/api/notices', noticesRouter);
app.use('/api/timetable', timetableRouter); // ✅ 추가
app.use('/api/specialSession', specialSessionsRouter); // ✅ 추가
app.use("/api/courses", coursesRouter);
app.use("/api/assign-level", assignLevelRoutes);

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
