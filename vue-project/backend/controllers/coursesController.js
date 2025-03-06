import Course from "../models/Courses.js";

// ✅ 과목 추가
export const createCourse = async (req, res) => {
  try {
    const { name, professor, grade, class_section, type } = req.body;
    if (!name || !grade) {
      return res.status(400).json({ error: "필수 입력값이 누락되었습니다." });
    }

    const newCourseId = await Course.create({ name, professor, grade, class_section, type });
    res.status(201).json({ id: newCourseId, name, professor, grade, class_section, type });
  } catch (err) {
    console.error("🚨 과목 추가 오류:", err);
    res.status(500).json({ error: "과목 추가 실패" });
  }
};

// ✅ 과목 목록 조회
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.getAll();
    res.json(courses);
  } catch (err) {
    console.error("🚨 과목 조회 오류:", err);
    res.status(500).json({ error: "과목 목록 불러오기 실패" });
  }
};



// ✅ 시간표 삭제
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await Course.delete(id);
    if (!affectedRows) return res.status(404).json({ error: "해당 시간표가 존재하지 않습니다." });

    res.json({ message: "시간표가 삭제되었습니다." });
  } catch (err) {
    console.error("🚨 시간표 삭제 오류:", err);
    res.status(500).json({ error: "시간표 삭제에 실패했습니다." });
  }
};
