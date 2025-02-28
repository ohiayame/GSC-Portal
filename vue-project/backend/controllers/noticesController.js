import Notice from '../models/Notices.js';

// ✅ 공지사항 목록 조회
export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.getAll();
    res.json(notices);
  } catch (err) {
    console.error("🚨 공지사항 조회 오류:", err);
    res.status(500).json({ error: "공지사항을 불러오는 데 실패했습니다." });
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
    const { title, content, author_id, target, priority } = req.body;

    if (!title || !content || !author_id) {
      return res.status(400).json({ error: "필수 입력값이 누락되었습니다." });
    }

    const newNoticeId = await Notice.create({ title, content, author_id, target, priority });
    res.status(201).json({ id: newNoticeId, title, content, author_id, target, priority });
  } catch (err) {
    console.error("🚨 공지사항 추가 오류:", err);
    res.status(500).json({ error: "공지사항 추가에 실패했습니다." });
  }
};

// ✅ 공지사항 수정
export const updateNotice = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;
    const affectedRows = await Notice.update(id, { title, content });

    if (!affectedRows) return res.status(404).json({ error: "해당 공지사항이 존재하지 않습니다." });

    res.json({ id, title, content });
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
