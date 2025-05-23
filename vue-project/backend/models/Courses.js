import db from "../config/db.js";

const Course = {
  // ✅ 과목 추가
  async create({ course_name, professor, grade, class_section, type }) {
    const [result] = await db.query(
      "INSERT INTO courses (course_name, professor, grade, class_section, type) VALUES (?, ?, ?, ?, ?)",
      [course_name, professor || "정영철", grade, class_section, type || "regular"]
    );
    return result.insertId;
  },

  // ✅ 과목 목록 조회
  async getAll() {
    const [rows] = await db.query("SELECT * FROM courses");
    return rows;
  },


  // ✅ 과목 정보 수정 추가
  async update(course_id, { course_name, professor, grade, class_section, type }) {
    const [result] = await db.query(
      `UPDATE courses
        SET course_name = ?, professor = ?, grade = ?, class_section = ?, type = ?
        WHERE course_id = ?`,
      [course_name, professor, grade, class_section, type, course_id]
    );
    return result.affectedRows; // 수정된 행 수 반환
  },



  // ✅ 과목 삭제 (ON DELETE CASCADE로 timetable도 자동 삭제됨)
  async delete(course_id) {
    const [result] = await db.query("DELETE FROM courses WHERE course_id = ?", [course_id]);
    return result.affectedRows; // 삭제된 행 수 반환
  },

  // 분반 조회
  async getUnassignedCourses(grade) {
    const [rows] = await db.query(
      `SELECT c.* FROM courses c
      JOIN timetable t ON c.course_id = t.course_id
      WHERE (c.type = 'special' OR c.class_section IS NOT NULL)
        AND c.grade = ?
        AND t.end_date >= CURDATE()
        AND c.course_id NOT IN (
          SELECT DISTINCT course_id FROM course_assignments
        )`,
      [grade]
    );
    return rows;
  }


};

export default Course;
