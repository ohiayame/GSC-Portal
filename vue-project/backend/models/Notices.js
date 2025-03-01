import pool from '../config/db.js';

class Notice {
  // ✅ 공지사항 전체 조회
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM notices ORDER BY created_at DESC");
    return rows;
  }
  // ✅ 공지사항 목록 조회 (검색 기능 추가)
  static async findAll({ target = 0, keyword = "" }) {
    let query = `SELECT * FROM notices WHERE 1=1`;
    let queryParams = [];

    // ✅ 대상 학년 필터링 (전체 대상이 아닐 경우)
    if (target && target != 0) {
      query += " AND target = ?";
      queryParams.push(target);
    }

    // ✅ 키워드 검색 (제목 또는 내용에 포함된 경우)
    if (keyword) {
      query += " AND (title LIKE ? OR content LIKE ?)";
      queryParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    query += " ORDER BY created_at DESC"; // 최신순 정렬

    const [rows] = await pool.query(query, queryParams);
    return rows;
  }


  // ✅ 개별 공지사항 조회
  static async getById(id) {
    const [rows] = await pool.query("SELECT * FROM notices WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  // ✅ 공지사항 추가
  static async create({ title, content, author_id, target, priority}) {
    const [result] = await pool.query(
      `INSERT INTO notices (title, content, author_id, target, priority) VALUES (?, ?, ?, ?, ?)`,
      [title, content, author_id, target, priority]
    );
    return result.insertId;
  }

  // ✅ 공지사항 수정 (모든 필드 반영)
  static async update(id, { title, content, author_id, target, priority }) {
    const [result] = await pool.query(
      `UPDATE notices
      SET title = ?, content = ?, author_id = ?, target = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [title, content, author_id, target, priority, id]
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
