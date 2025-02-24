import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

dotenv.config();  // 환경 변수 로드

const app = express();

//  미들웨어 설정
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); //  CORS 설정 (쿠키 포함)
app.use(session({ secret: process.env.SESSION_SECRET || 'mySuperSecretKey', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//  사용자 데이터 저장 (실제 서비스에서는 DB 사용)
const users = new Map();

//  Google OAuth 설정
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  console.log("✅ 사용자 정보:", profile);

  //  JWT 발급
  const jwtAccessToken = jwt.sign({ userName: profile.name, email: profile.emails[0].value }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const jwtRefreshToken = jwt.sign({ userName: profile.name }, process.env.JWT_SECRET, { expiresIn: "7d" });

  //  Refresh Token 저장
  users.set(profile.name, { refreshToken: jwtRefreshToken, email: profile.emails[0].value });

  return done(null, { name: profile.name, email: profile.emails[0].value, accessToken: jwtAccessToken, refreshToken: jwtRefreshToken });
}));

//  세션 직렬화 & 역직렬화
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

//  Google 로그인 라우트 (팝업 창에서 로그인)
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent' }));

//  Google 로그인 콜백 처리 (로그인 성공 후 부모 창에서 `home`으로 이동)
app.get('/auth/google/call', passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }), (req, res) => {
  if (!req.user) return res.status(401).json({ message: "인증 실패" });

  //  쿠키 저장 (sameSite 설정)
  res.cookie('accessToken', req.user.accessToken, { httpOnly: true, secure: true, sameSite: 'None' });
  res.cookie('refreshToken', req.user.refreshToken, { httpOnly: true, secure: true, sameSite: 'None' });
 // 
  res.redirect('http://localhost:5173/');
});

//  로그인된 사용자 정보 반환
app.get('/auth/user', (req, res) => {
  console.log("🛠️ /auth/user 요청 받음");

  const token = req.cookies.accessToken;
  if (!token) {
    console.error("❌ Access Token이 없음");
    return res.status(401).json({ message: "인증되지 않은 사용자" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ 유효한 사용자:", decoded);
    res.json({ user: decoded });
  } catch (err) {
    console.error("❌ 유효하지 않은 토큰:", err.message);
    res.status(403).json({ message: "토큰이 유효하지 않습니다." });
  }
});

//  로그아웃 (쿠키 삭제)
app.get('/auth/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  // res.redirect('http://localhost:5173/login');
  res.status(200).json({ message: "로그아웃 성공" });
});

//  서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ 서버 실행 중: http://localhost:${PORT}`));
