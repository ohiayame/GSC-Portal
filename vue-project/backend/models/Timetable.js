import db from "../config/db.js";

const Timetable = {
  // ✅ 시간표 조회
  async getAll() {
    const [rows] = await db.query(`
      SELECT t.*,
            c.name AS course_name,
            c.professor,
            c.grade,
            c.class_section
      FROM timetable t
      JOIN courses c ON t.course_id = c.id
    `);
    return rows;
  },

    // ✅ 특정 학년의 시간표 조회
  async getByGrade(grade) {
    const [rows] = await db.query(
      `SELECT t.*, c.name AS course_name, c.professor, c.grade, c.class_section
        FROM timetable t
        JOIN courses c ON t.course_id = c.id
        WHERE c.grade = ?`,
      [grade]
    );
    return rows;
  },

  // ✅ 시간표 추가
  async create({ course_id, day, period, duration, location, start_date, end_date }) {
    const [result] = await db.query(
      "INSERT INTO timetable (course_id, day, period, duration, location, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [course_id, day, period, duration, location, start_date, end_date]
    );
    return result.insertId;
  },

  // ✅ 시간표 수정
  async update({course_id, day, period, duration, location, start_date, end_date }) {
    const [result] = await db.query(
      `UPDATE timetable
        SET day = ?, period = ?, duration = ?, location = ?, start_date = ?, end_date = ?
        WHERE course_id = ?`,
      [day, period, duration, location, start_date, end_date, course_id]
    );
    return result.affectedRows; // 수정된 행 수 반환
  },

  // ✅ 특정 시간표 삭제
  async delete(id) {
    const [result] = await db.query("DELETE FROM timetable WHERE id = ?", [id]);
    return result.affectedRows;
  },
};

// 📌 ❗ 여기 추가해야 함! (default export)
export default Timetable;
