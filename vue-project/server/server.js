import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();  // .env 파일에서 환경 변수 로드

const app = express();

// CORS 설정 (Vue와 연동)
app.use(cors({
  origin: 'http://localhost:5173', // Vue 개발 서버 주소
  credentials: true
}));

// 세션 설정 (secret 없으면 오류 발생)
app.use(session({
  secret: process.env.SESSION_SECRET || 'mySuperSecretKey',  // 환경 변수 또는 기본값 사용
  resave: false,
  saveUninitialized: false
}));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth 설정
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// ✅ Google 로그인 라우트 (클라이언트에서 요청)
app.get('/auth/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

// ✅ Google OAuth 인증 후 콜백 (로그인 성공 후 리디렉션)
app.get('/auth/google/call', passport.authenticate('google', {
  failureRedirect: 'http://localhost:5173/login'
}), (req, res) => {
  res.redirect('http://localhost:5173');  // 로그인 성공 시 Vue 홈으로 이동
});

// ✅ 로그인된 사용자 정보 반환
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: '로그인 필요' });
  }
});

// ✅ 로그아웃 처리
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:5173/login');
  });
});

// ✅ 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
