import db from "../config/db.js";

const Timetable = {
  // ✅ 시간표 조회
  async getAll() {
    const [rows] = await db.query(`
      SELECT t.*,
            DATE_FORMAT(t.start_date, '%Y-%m-%d') AS start_date,
            DATE_FORMAT(t.end_date, '%Y-%m-%d') AS end_date,
            c.course_name,
            c.professor,
            c.grade,
            c.class_section,
            c.type
      FROM timetable t
      JOIN courses c ON t.course_id = c.course_id
    `);
    // console.log(rows)
    return rows;
  },

    // ✅ 특정 학년의 시간표 조회
  async getByGrade(grade) {
    const [rows] = await db.query(
      `SELECT t.*, c.course_name AS course_name, c.professor, c.grade, c.class_section
        FROM timetable t
        JOIN courses c ON t.course_id = c.course_id
        WHERE c.grade = ?`,
      [grade]
    );
    return rows;
  },
  // ✅ 중복 검사 함수
  async checkDuplicateTimetable(grade, day, period, duration, class_section) {
    const [rows] = await db.query(
      `SELECT t.*, c.class_section
      FROM timetable t
      JOIN courses c ON t.course_id = c.course_id
      WHERE c.grade = ?
      AND t.day = ?
      AND t.period < ? + ?
      AND t.period + t.duration > ?`,
      [grade, day, period, duration, period]
    );

    // 🔹 중복된 항목이 없으면 true 반환
    if (rows.length === 0) return true;

    // 🔹 중복된 수업이 있지만, 모든 수업이 분반이 설정되어 있으면 등록 가능
    const hasNoSection = rows.some((cls) => cls.class_section === 1) || class_section === 1;
    return hasNoSection ? false : true;
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
  async delete(course_id) {
    const [result] = await db.query("DELETE FROM timetable WHERE course_id = ?", [course_id]);
    return result.affectedRows;
  },
};

// 📌 ❗ 여기 추가해야 함! (default export)
export default Timetable;
