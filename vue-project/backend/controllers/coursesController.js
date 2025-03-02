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
