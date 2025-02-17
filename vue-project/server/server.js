import dotenv from "dotenv";
dotenv.config(); 
import express from "express";  // 웹 서버 라이브러리
import session from "express-session";  // 세션 관리
import passport from "passport";  // 인증 처리
import { Strategy as GoogleStrategy } from "passport-google-oauth20";  // Google OAuth


const app = express(); // 서버를 생성

// ✅ `express-session` 추가 (세션 설정)
app.use(session({
  secret: "your_secret_key", // 원하는 문자열 설정
  resave: false, // 사용자가 요청할 때마다 세션을 다시 저장하지 않도록 설정
  saveUninitialized: true // 로그인하지 않은 사용자도 기본 세션을 생성하도록 설정
}));

// ✅ Passport 초기화 및 세션 설정
app.use(passport.initialize()); //  로그인 기능을 활성화
app.use(passport.session()); // 세션에 저장

// ✅ Google OAuth 설정
passport.use(
    new GoogleStrategy(
        {// .env 파일 불러온 값이 대입입
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        (accessToken, refreshToken, profile, done) => {
        console.log("Google Profile:", profile);  //  로그인한 사용자 정보를 터미널(콘솔)에 출력
        return done(null, profile); // 로그인 성공 후 사용자 정보를 저장
        }
    )
);

// ✅ 세션 직렬화 & 역직렬화 설정
passport.serializeUser((user, done) => done(null, user)); // 사용자의 정보를 세션에 저장
passport.deserializeUser((obj, done) => done(null, obj)); // 저장된 사용자 정보를 불러옴

app.get("/", (req, res) => {  // http://localhost:3000에 접속하면
    res.send("Google OAuth 로그인 테스트 페이지"); // 출력
});

// ✅ Google 로그인 요청
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google 인증 후 콜백 처리
//  로그인을 마치면, Google이 /auth/google/callback URL로 정보를 보냄
app.get("/auth/google/callback",
    //  로그인 실패하면 / (메인 페이지)로 이동
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        res.json({ message: "로그인 성공", user: req.user }); //  JSON 형식으로 사용자 정보 출력
    }
);
// 서버를 3000번 포트에서 실행
app.listen(3000, () => console.log("서버 실행 중 http://localhost:3000"));
