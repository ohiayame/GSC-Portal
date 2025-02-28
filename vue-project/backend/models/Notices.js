import pool from '../config/db.js';

class Notice {
  // ✅ 공지사항 전체 조회
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM notices ORDER BY created_at DESC");
    return rows;
  }

  // ✅ 개별 공지사항 조회
  static async getById(id) {
    const [rows] = await pool.query("SELECT * FROM notices WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  // ✅ 공지사항 추가
  static async create({ title, content, author_id, target, priority }) {
    const [result] = await pool.query(
      `INSERT INTO notices (title, content, author_id, target, priority) VALUES (?, ?, ?, ?, ?)`,
      [title, content, author_id, target || 0, priority || 'normal']
    );
    return result.insertId;
  }

  // ✅ 공지사항 수정
  static async update(id, { title, content }) {
    const [result] = await pool.query(
      `UPDATE notices SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, content, id]
    );
    return result.affectedRows;
  }

  // ✅ 공지사항 삭제
  static async delete(id) {
    const [result] = await pool.query("DELETE FROM notices WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

export default Notice;
