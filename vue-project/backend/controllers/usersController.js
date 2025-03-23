import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserByEmail, createUser } from '../models/Users.js';

dotenv.config();

// ✅ Google 로그인 처리
export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
      return res.status(400).json({ error: "Authorization Credential이 없습니다." });
  }

  try {
      console.log("🔍 [SERVER] Google ID 토큰 검증 중...");
      const ticket = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      const decodedUser = ticket.data;
      const { email, name } = decodedUser;

      console.log("🔍 [SERVER] Google 사용자 정보:", decodedUser);

      // ✅ DB에서 사용자 조회
      const user = await findUserByEmail(email);
      console.log("🔍 [SERVER] 사용자 정보:", user);

      if (!user) {
          console.log("🆕 [SERVER] 회원 정보 없음 → 회원가입 필요");
          const response = {
              success: false,
              needsRegistration: true,
              email,
              name,
              picture: decodedUser.picture,
              redirect:"/register"
            };
          console.log("🔹 [SERVER] 응답 데이터:", response);

          // ✅ 백엔드에서 응답을 정상적으로 보내는지 확인
          res.status(200).json(response);
          console.log("✅ [SERVER] 응답 전송 완료");
          return;
      }

      if (user.approved === 0) {
        console.log("⏳ [SERVER] 승인 대기 중인 사용자");
        return res.status(403).json({ error: "관리자 승인 대기 중입니다." });
    }

    // ✅ JWT 발급 후 메인 페이지 이동
    const jwtToken = jwt.sign(
        { id: user.id,
          name: user.name,
          grade: user.grade,
          email: user.email,
          phone: user.phone,
          international: user.email,
          role: user.role,
          approved: user.approved
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.cookie("auth_token", jwtToken, { httpOnly: true });
    console.log("✅ [SERVER] 로그인 성공 → 메인 화면 이동");

    res.status(200).json({
        success: true,
        token: jwtToken,
        user:{ id: user.id,
          name: user.name,
          grade: user.grade,
          email: user.email,
          phone: user.phone,
          international: user.email,
          role: user.role,
          approved: user.approved
        }
    });

  } catch (error) {
      console.error("❌ [SERVER] OAuth 인증 오류:", error);
      res.status(500).json({ error: "OAuth 인증 실패" });
  }
};



// ✅ 회원가입 요청 처리
export const registerUser = async (req, res) => {
    const { name, student_id, grade, email, phone, international } = req.body;

    try {
        await createUser(name, student_id, grade, email, phone, international);
        console.log("✅ 회원가입 완료 → 승인 대기");
        res.status(201).json({ message: "회원가입 성공. 관리자 승인 후 로그인 가능합니다." });

    } catch (error) {
        console.error("❌ 회원가입 오류:", error.message);
        res.status(500).json({ error: "회원가입 실패" });
    }
};

// ✅ 사용자 정보 조회
export const getUser = (req, res) => {
    try {
        // 🔍 쿠키 또는 Authorization 헤더에서 토큰 추출
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = req.cookies.auth_token || tokenFromHeader;

        if (!token) {
            return res.status(401).json({ error: "로그인 정보가 없습니다." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ user: decoded });

    } catch (error) {
        res.status(401).json({ error: "인증 실패" });
    }
};

// ✅ 로그아웃 처리
export const logoutUser = (req, res) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax"
    });
    console.log("✅ 로그아웃 완료");
    res.status(200).json({ success: true, message: "로그아웃 완료" });
};
