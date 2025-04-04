import Notice from '../models/Notices.js';
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sendLineMessage } from '../utils/lineMessenger.js';

// 라인
export const sendNoticeMessage = async (userId, message) => {
  try {
    await sendLineMessage(userId, message);
  } catch (error) {
    console.error("🔴 라인 메시지 전송 실패:", error);
  }
};

// ✅ 공지사항 목록 조회 (검색 기능 포함)
export const getNotices = async (req, res) => {
  try {
    const { target, course_id, keyword } = req.query;

    console.log("📌 검색 요청:", { target, course_id, keyword });

    const notices = await Notice.findAll({ target, course_id, keyword });
    res.json(notices);
  } catch (err) {
    console.error("🚨 공지사항 조회 오류:", err);
    res.status(500).json({ error: "공지사항을 불러오지 못했습니다." });
  }
};


// ✅ 개별 공지사항 조회
export const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.getById(id);
    if (!notice) return res.status(404).json({ error: "공지사항을 찾을 수 없습니다." });
    res.json(notice);
  } catch (err) {
    console.error("🚨 개별 공지사항 조회 오류:", err);
    res.status(500).json({ error: "공지사항을 불러오는 데 실패했습니다." });
  }
};

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "uploads/"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ 파일 업로드 컨트롤러
export const uploadFile = (req, res) => {
  console.log("📌 파일 업로드 요청 도착");

  console.log("📌 요청 헤더:", req.headers);
  console.log("📌 요청 바디:", req.body);
  console.log("📌 요청 파일:", req.file);

  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("🚨 파일 업로드 오류:", err);
      return res.status(500).json({ error: "파일 업로드 실패", details: err });
    }

    if (!req.file) {
      console.error("🚨 업로드된 파일 없음");
      return res.status(400).json({ error: "파일이 없습니다." });
    }

    // ✅ 저장된 파일의 URL 생성
    const file_url = `uploads/${req.file.filename}`;
    console.log("📌 업로드된 파일 URL:", file_url);
    res.json({ file_url }); // ✅ 업로드된 파일 경로 반환
  });
};

// ✅ 공지사항 추가
export const createNotice = async (req, res) => {
  try {
    console.log("📌 요청 받은 데이터:", req.body);

    const { title, content, author_id, target, priority, course_id, file_url, send_line } = req.body;

    if (!title || !content || !author_id) {
      return res.status(400).json({ error: "필수 입력값이 누락되었습니다." });
    }

    const newNoticeId = await Notice.create({ title, content, author_id, target, priority, course_id, file_url });

    if (send_line){
      const lineMessage = `📢 공지사항 등록됨\n\n제목: ${title}\n\n${content}`;
      await sendNoticeMessage(process.env.LINE_TEST_USER_ID, lineMessage);
    }

    res.status(201).json({ id: newNoticeId, title, content, author_id, target, priority, course_id, file_url });
  } catch (err) {
    console.error("🚨 공지사항 추가 오류:", err);
    res.status(500).json({ error: "공지사항 추가에 실패했습니다." });
  }
};

// ✅ 공지사항 수정
export const updateNotice = async (req, res) => {
  try {
    const { title, content, author_id, target, priority, course_id, file_url, send_line } = req.body; // ✅ 모든 필드 추가
    const { id } = req.params;

    // ✅ DB 업데이트 수행
    const affectedRows = await Notice.update(id, { title, content, author_id, target, priority, course_id, file_url });

    if (!affectedRows) return res.status(404).json({ error: "해당 공지사항이 존재하지 않습니다." });

    if (send_line){
      const lineMessage = `📢 공지사항 등록됨\n\n제목: ${title}\n\n${content}`;
      await sendNoticeMessage(process.env.LINE_TEST_USER_ID, lineMessage);
    }

    res.json({ id, title, content, author_id, target, priority, course_id, file_url }); // ✅ 모든 필드 반환
  } catch (err) {
    console.error("🚨 공지사항 수정 오류:", err);
    res.status(500).json({ error: "공지사항 수정에 실패했습니다." });
  }
};

// ✅ 공지사항 삭제
export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await Notice.delete(id);

    if (!affectedRows) return res.status(404).json({ error: "삭제할 공지사항이 없습니다." });

    res.json({ message: "공지사항이 삭제되었습니다." });
  } catch (err) {
    console.error("🚨 공지사항 삭제 오류:", err);
    res.status(500).json({ error: "공지사항 삭제에 실패했습니다." });
  }
};

// ✅ ES 모듈 환경에서 __dirname을 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 공지사항 파일 삭제 로직
export const deleteNoticeFile = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads", filename); // ✅ 업로드 폴더 경로

    // 파일 존재 여부 확인 후 삭제
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("🚨 파일 삭제 실패:", err);
            return res.status(500).json({ error: "파일 삭제 실패" });
        }
        console.log("✅ 파일 삭제 완료:", filename);
        res.json({ message: "파일 삭제 성공" });
    });
};
