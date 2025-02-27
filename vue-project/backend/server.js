const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
// console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRoutes = require('./routes/users');
console.log("🔍 authRoutes:", authRoutes); 
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
    console.log(`🔍 ${req.method} 요청 → ${req.url}`);
    next();
});

app.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
