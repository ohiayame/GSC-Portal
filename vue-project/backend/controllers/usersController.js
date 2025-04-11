import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserByEmail, createUser,
        findAllUsers, approveUserById,
        deleteUserById, updateRole } from '../models/Users.js';
import { findAllowedEmail } from '../models/allowedEmails.js';
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

      if (!email.endsWith('@g.yju.ac.kr')) {
        const allowed = await findAllowedEmail(email);
        console.log("allowed", allowed)
        if (!allowed) {
          res.status(403).json({ error: "허용되지 않은 외부 이메일입니다." });
          return;
        }
      }

      // DB에서 사용자 조회
      const user = await findUserByEmail(email);
      // console.log("🔍 [SERVER] 사용자 정보:", user);

      if (!user) {
          // console.log("🆕 [SERVER] 회원 정보 없음 → 회원가입 필요");
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
          international: user.international,
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
        if (error.code === 'ER_DUP_ENTRY') {
          if (error.message.includes('student_id')) {
            return res.status(409).json({ error: "이미 사용 중인 학번입니다." });
          }
          if (error.message.includes('email')) {
            return res.status(409).json({ error: "이미 사용 중인 이메일입니다." });
          }
        }

        res.status(500).json({ error: "회원가입 중 알 수 없는 오류가 발생했습니다." });
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

// ✅ 관리자 - 전체 사용자 목록 (프론트에서 필터링)
export const getAllUsers = async (req, res) => {
  try {
    const users = await findAllUsers();
    console.log("회원정보 :", users);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "전체 사용자 목록 조회 실패" });
  }
};

export const approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    await approveUserById(id);
    res.status(200).json({ message: "사용자 승인 완료" });
  } catch (error) {
    res.status(500).json({ error: "사용자 승인 실패" });
  }
};

// ✅ 관리자 - 사용자 거절 (삭제)
export const rejectUser = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUserById(id);
    res.status(200).json({ message: "사용자 삭제 완료" });
  } catch (error) {
    res.status(500).json({ error: "사용자 삭제 실패" });
  }
};

export const Role = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  await updateRole(id, role)
  res.status(200).json({ message: "권한 수정 완료" });
}
