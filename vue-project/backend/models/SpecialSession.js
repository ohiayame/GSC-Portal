import pool from "../config/db.js";

class SpecialSession {
  // ✅ 전체 휴·보강 조회
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT s.*, c.name AS subject, c.professor
      FROM special_sessions s
      JOIN courses c ON s.course_id = c.id
    `);
    return rows;
  }

  // ✅ 특정 과목의 휴·보강 조회
  static async getByCourse(course_id) {
    const [rows] = await pool.query("SELECT * FROM special_sessions WHERE course_id = ?", [course_id]);
    return rows;
  }

  // ✅ 특정 날짜의 휴·보강 조회
  static async getByDate(date) {
    const [rows] = await pool.query("SELECT * FROM special_sessions WHERE date = ?", [date]);
    return rows;
  }

  // ✅ 휴·보강 추가
  static async create({ course_id, date, type, start_period, duration, location }) {
    const [result] = await pool.query(`
      INSERT INTO special_sessions (course_id, date, type, start_period, duration, location)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [course_id, date, type, start_period, duration, location]
    );
    return result.insertId;
  }

  // ✅ 휴·보강 삭제
  static async delete(id) {
    const [result] = await pool.query("DELETE FROM special_sessions WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

export default SpecialSession;
