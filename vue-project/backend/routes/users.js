import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ✅ GET 요청 처리 (기존 Authorization Code Flow 유지)
router.get('/google/callback', async (req, res) => {
    console.log("🔍 GET 요청 Authorization Code 확인:", req.query);
    const { credential } = req.query;

    if (!credential) {
        console.error("❌ Authorization Code가 없음");
        return res.status(400).json({ error: "Authorization Code가 없습니다." });
    }

    try {
        console.log("🔹 Google에 Access Token 요청 시작...");
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
            credential,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_CALLBACK_URL,
            grant_type: "authorization_code"
        });

        console.log("✅ Token Response:", tokenResponse.data);
        const { access_token, refresh_token, id_token } = tokenResponse.data;
        const decodedUser = jwt.decode(id_token);

        console.log("✅ 사용자 정보 디코딩 완료:", decodedUser);

        const jwtToken = jwt.sign(
            { email: decodedUser.email, name: decodedUser.name, picture: decodedUser.picture },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("✅ JWT 생성 완료:", jwtToken);
        res.cookie("auth_token", jwtToken, { httpOnly: true });
        res.redirect("http://localhost:5173");

    } catch (error) {
        console.error("❌ OAuth 인증 오류:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "OAuth 인증 실패" });
    }
});

// ✅ POST 요청 처리 (Google Credential 방식)
router.post('/google/callback', async (req, res) => {
    console.log("🔍 POST 요청 Authorization Credential 확인:", req.body);

    const { credential } = req.body;

    if (!credential) {
        console.error("❌ POST 요청에서 Authorization Credential이 없음");
        return res.status(400).json({ error: "Authorization Credential이 없습니다." });
    }

    try {
        console.log("🔹 Google의 공개 키를 사용하여 Credential 검증...");
        const ticket = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        const decodedUser = ticket.data;  // 사용자 정보 추출

        console.log("✅ Google 사용자 정보:", decodedUser);

        const jwtToken = jwt.sign(
            { email: decodedUser.email, name: decodedUser.name, picture: decodedUser.picture },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("✅ JWT 생성 완료:", jwtToken);
        res.cookie("auth_token", jwtToken, { httpOnly: true });
        res.redirect("http://localhost:5173/");

    } catch (error) {
        console.error("❌ OAuth 인증 오류:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "OAuth 인증 실패" });
    }
});

router.get('/user', (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: "로그인 정보가 없습니다." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ user: decoded });

    } catch (error) {
        res.status(401).json({ error: "인증 실패" });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: false,   // 개발 환경에서는 false, 프로덕션에서는 true로 변경
        sameSite: "Lax"
    });
    console.log("✅ 로그아웃 완료");
    res.status(200).json({ success: true, message: "로그아웃 완료" });
});

export default router;
