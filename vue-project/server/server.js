import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

dotenv.config();  // .env 파일에서 환경 변수 로드

const app = express();

// ✅ 쿠키 파서 미들웨어 추가
app.use(cookieParser());

// ✅ CORS 설정 (Vue와 연동)
app.use(cors({
  origin: 'http://localhost:5173', // Vue 개발 서버 주소
  credentials: true
}));

// ✅ 세션 설정 (세션 미들웨어는 필요하지만, JWT와 함께 보완적으로 사용)
app.use(session({
  secret: process.env.SESSION_SECRET || 'mySuperSecretKey',
  resave: false,
  saveUninitialized: false
}));

// ✅ Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// ✅ 사용자 데이터 저장 (Refresh Token을 저장할 수 있도록 DB 연동 가능)
const users = new Map(); // 🚨 실서비스에서는 DB 사용 필요

// ✅ Google OAuth 설정
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true  // ✅ Refresh Token 받기 위해 추가
}, (req, accessToken, refreshToken, profile, done) => {
  console.log("✅ Access Token:", accessToken);
  console.log("✅ Refresh Token:", refreshToken);  // 🚨 Google OAuth 기본 설정에서는 Refresh Token 제공 X
  console.log("✅ 사용자 정보:", profile);

  // ✅ JWT 생성 (Access Token)
  const jwtAccessToken = jwt.sign(
    { userId: profile.id, email: profile.emails[0].value },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Access Token 15분 유효
  );

  // ✅ Refresh Token 저장 (DB 또는 서버 세션)
  users.set(profile.id, {
    refreshToken: refreshToken || null,  // Refresh Token이 존재하는 경우 저장
    email: profile.emails[0].value
  });

  return done(null, { id: profile.id, email: profile.emails[0].value, accessToken: jwtAccessToken });
}));

// ✅ 직렬화 & 역직렬화
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// ✅ Google 로그인 라우트 (클라이언트에서 요청)
app.get('/auth/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  accessType: 'offline',  // ✅ Refresh Token 요청 활성화
  prompt: 'consent'       // ✅ Refresh Token 매번 요청
}));

// ✅ Google OAuth 인증 후 콜백 (로그인 성공 후 리디렉션)
app.get('/auth/google/call', passport.authenticate('google', {
  failureRedirect: 'http://localhost:5173/login',
  successRedirect: 'http://localhost:5173/'
}), (req, res) => {
  if (!req.user || !req.user.accessToken) {
    return res.status(401).json({ message: "인증 실패" });
  }

  // ✅ Access Token을 HttpOnly 쿠키에 저장
  res.cookie('accessToken', req.user.accessToken, {
    httpOnly: true,  // JavaScript에서 접근 불가능 (XSS 방어)
    secure: false,   // 개발 환경에서는 false, 배포 환경에서는 true 필요
    sameSite: 'Strict' // CSRF 방어
  });

  res.redirect('http://localhost:5173');  // ✅ 로그인 성공 후 Vue 홈으로 이동
});

// ✅ 로그인된 사용자 정보 반환
app.get('/auth/user', (req, res) => {
  const token = req.cookies.accessToken;  // ✅ 쿠키에서 Access Token 가져오기

  if (!token) {
    return res.status(401).json({ message: "인증되지 않은 사용자" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "로그인 상태 유지됨", user: decoded });
  } catch (err) {
    return res.status(403).json({ message: "토큰이 유효하지 않습니다." });
  }
});

// ✅ Refresh Token을 사용하여 Access Token 갱신
app.post('/auth/refresh', (req, res) => {
  const userId = req.body.userId;  // 클라이언트에서 userId 전달 필요
  const user = users.get(userId);

  if (!user || !user.refreshToken) {
    return res.status(401).json({ message: "Refresh Token이 없습니다." });
  }

  // ✅ 새로운 Access Token 발급
  const newAccessToken = jwt.sign(
    { userId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'Strict'
  });

  res.json({ accessToken: newAccessToken });
});

// ✅ 로그아웃 처리 (쿠키 삭제)
app.get('/auth/logout', (req, res) => {
  res.clearCookie('accessToken');  // ✅ Access Token 쿠키 삭제
  res.redirect('http://localhost:5173/login');
});

// ✅ 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
