import SpecialSession from "../models/SpecialSession.js";

// ✅ 전체 휴·보강 조회
export const getAllSpecialSessions = async (req, res) => {
  try {
    const specialSessions = await SpecialSession.getAll();
    res.json(specialSessions);
  } catch (err) {
    console.error("🚨 휴·보강 조회 오류:", err);
    res.status(500).json({ error: "휴·보강 데이터를 불러오는 데 실패했습니다." });
  }
};

// ✅ 특정 과목의 휴·보강 조회
export const getSpecialSessionsByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const specialSessions = await SpecialSession.getByCourse(course_id);
    res.json(specialSessions);
  } catch (err) {
    console.error("🚨 특정 과목 휴·보강 조회 오류:", err);
    res.status(500).json({ error: "해당 과목의 휴·보강 데이터를 불러오는 데 실패했습니다." });
  }
};

// ✅ 특정 날짜의 휴·보강 조회
export const getSpecialSessionsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const specialSessions = await SpecialSession.getByDate(date);
    res.json(specialSessions);
  } catch (err) {
    console.error("🚨 특정 날짜 휴·보강 조회 오류:", err);
    res.status(500).json({ error: "해당 날짜의 휴·보강 데이터를 불러오는 데 실패했습니다." });
  }
};

// ✅ 휴·보강 추가
export const createSpecialSession = async (req, res) => {
  try {
    const { course_id, date, type, start_period, duration, location } = req.body;

    // 🚨 필수 값 검증
    if (!course_id || !date || !type) {
      return res.status(400).json({ error: "필수 입력값이 누락되었습니다." });
    }

    const newSessionId = await SpecialSession.create({ course_id, date, type, start_period, duration, location });
    res.status(201).json({ id: newSessionId, course_id, date, type, start_period, duration, location });
  } catch (err) {
    console.error("🚨 휴·보강 추가 오류:", err);
    res.status(500).json({ error: "휴·보강 추가에 실패했습니다." });
  }
};

// ✅ 휴·보강 삭제
export const deleteSpecialSession = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await SpecialSession.delete(id);

    if (!affectedRows) {
      return res.status(404).json({ error: "해당 휴·보강 데이터가 존재하지 않습니다." });
    }

    res.json({ message: "휴·보강 정보가 삭제되었습니다." });
  } catch (err) {
    console.error("🚨 휴·보강 삭제 오류:", err);
    res.status(500).json({ error: "휴·보강 삭제에 실패했습니다." });
  }
};
