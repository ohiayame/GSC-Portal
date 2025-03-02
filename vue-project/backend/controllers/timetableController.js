import Timetable from "../models/Timetable.js";

// ✅ 전체 시간표 조회
export const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.getAll();
    res.json(timetables);
  } catch (err) {
    console.error("🚨 시간표 조회 오류:", err);
    res.status(500).json({ error: "시간표를 불러오는 데 실패했습니다." });
  }
};

// ✅ 특정 학년 시간표 조회
export const getTimetableByGrade = async (req, res) => {
  try {
    const { grade } = req.params;
    const timetables = await Timetable.getByGrade(grade);
    res.json(timetables);
  } catch (err) {
    console.error("🚨 특정 학년 시간표 조회 오류:", err);
    res.status(500).json({ error: "시간표를 불러오는 데 실패했습니다." });
  }
};

// ✅ 특정 과목 시간표 조회
export const getTimetableByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const timetables = await Timetable.getByCourse(course_id);
    res.json(timetables);
  } catch (err) {
    console.error("🚨 특정 과목 시간표 조회 오류:", err);
    res.status(500).json({ error: "시간표를 불러오는 데 실패했습니다." });
  }
};

// ✅ 시간표 추가
export const createTimetable = async (req, res) => {
  try {
    const { course_id, day, period, duration, location, start_date, end_date } = req.body;

    console.log("📌 요청된 시간표 데이터:", req.body); // 🔍 요청된 데이터 확인

    if (!course_id || !day || !period || !duration || !start_date || !end_date) {
      console.error("🚨 필수 데이터 누락됨!");
      return res.status(400).json({ error: "필수 입력값이 누락되었습니다." });
    }

    await Timetable.create({ course_id, day, period, duration, location, start_date, end_date });
    res.status(201).json({ message: "시간표 추가 완료" });
  } catch (error) {
    console.error("🚨 시간표 추가 오류:", error);
    res.status(500).json({ error: "시간표 추가 실패" });
  }
};



// ✅ 시간표 삭제
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await Timetable.delete(id);
    if (!affectedRows) return res.status(404).json({ error: "해당 시간표가 존재하지 않습니다." });

    res.json({ message: "시간표가 삭제되었습니다." });
  } catch (err) {
    console.error("🚨 시간표 삭제 오류:", err);
    res.status(500).json({ error: "시간표 삭제에 실패했습니다." });
  }
};
