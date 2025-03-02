import db from "../config/db.js";

const Timetable = {
  // ✅ 시간표 조회
  async getAll() {
    const [rows] = await db.query("SELECT * FROM timetable");
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

  // ✅ 특정 시간표 삭제
  async delete(id) {
    const [result] = await db.query("DELETE FROM timetable WHERE id = ?", [id]);
    return result.affectedRows;
  },
};

// 📌 ❗ 여기 추가해야 함! (default export)
export default Timetable;
