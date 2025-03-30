import { insertCourseLevel } from "../models/course_level.js";

export const saveAssignments = async (req, res) => {
  try {
    const { assignments } = req.body; // assignments = [{ student_id, class_section }]
    console.log(assignments)
    for (const { student_id, course_id } of assignments) {
      await insertCourseLevel(course_id, student_id);
    }
    res.status(200).json({ message: "배정 완료" });
  } catch (err) {
    console.error("배정 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};
