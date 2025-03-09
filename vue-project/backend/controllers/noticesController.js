import Notice from '../models/Notices.js';

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

// ✅ 공지사항 추가
export const createNotice = async (req, res) => {
  try {
    console.log("📌 요청 받은 데이터:", req.body);

    const { title, content, author_id, target, priority, course_id } = req.body;

    if (!title || !content || !author_id) {
      return res.status(400).json({ error: "필수 입력값이 누락되었습니다." });
    }

    const newNoticeId = await Notice.create({ title, content, author_id, target, priority, course_id });
    res.status(201).json({ id: newNoticeId, title, content, author_id, target, priority, course_id });
  } catch (err) {
    console.error("🚨 공지사항 추가 오류:", err);
    res.status(500).json({ error: "공지사항 추가에 실패했습니다." });
  }
};

// ✅ 공지사항 수정
export const updateNotice = async (req, res) => {
  try {
    const { title, content, author_id, target, priority, course_id } = req.body; // ✅ 모든 필드 추가
    const { id } = req.params;

    // ✅ DB 업데이트 수행
    const affectedRows = await Notice.update(id, { title, content, author_id, target, priority, course_id });

    if (!affectedRows) return res.status(404).json({ error: "해당 공지사항이 존재하지 않습니다." });

    res.json({ id, title, content, author_id, target, priority, course_id }); // ✅ 모든 필드 반환
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
