import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';  // DB 연결
import noticesRoutes from './routes/notices.js';
import usersRoutes from './routes/users.js';

dotenv.config();  // .env 설정 불러오기
const app = express();

app.use(express.json());  // JSON 요청 처리
app.use(cors());  // CORS 허용

// API 라우트 등록
app.use('/api/notices', noticesRoutes);
app.use('/api/users', usersRoutes);

// 서버 실행
const PORT = process.env.PORT || 5000;
connectDB();  // DB 연결 실행
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
