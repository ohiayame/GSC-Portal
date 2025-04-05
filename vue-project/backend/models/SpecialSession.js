import pool from "../config/db.js"; // ✅ DB 연결 가져오기

export const SpecialSession = {
  // ✅ 새로운 보강/휴강 데이터 추가 (INSERT INTO)
  async create({ course_id, date, type, start_period, duration, location }) {
    try {
      // 1️⃣ 먼저 `courses` 테이블에 `course_id`가 있는지 확인
      const [courseExists] = await pool.execute("SELECT course_id FROM courses WHERE course_id = ?", [course_id]);

      if (courseExists.length === 0) {
        throw new Error(`❌ course_id ${course_id}가 존재하지 않습니다!`);
      }

      // 2️⃣ `special_sessions`에 데이터 삽입
      const query = `
        INSERT INTO special_sessions (course_id, date, type, start_period, duration, location)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const values = [course_id, date, type, start_period, duration, location];

      const [result] = await pool.execute(query, values); // ✅ pool 사용

      return { message: "보강/휴강이 등록되었습니다.", insertId: result.insertId };
    } catch (error) {
      console.error("❌ 보강/휴강 등록 오류:", error);
      throw error;
    }
  },

  // ✅ 모든 보강/휴강 데이터 조회
  async findAll() {
    try {
      const query = `
        SELECT
            s.id,
            s.course_id,
            DATE_FORMAT(s.date, '%Y-%m-%d') as date,
            s.type,
            s.start_period,
            s.duration,
            s.location,
            c.course_name,
            c.professor
        FROM special_sessions s
        JOIN courses c ON s.course_id = c.course_id
        ORDER BY
          FIELD(s.type, '휴강', '보강'),
          s.date ASC;
      `;
      const [results] = await pool.execute(query);

      // console.log(results) // ✅ pool 사용
      return results;
    } catch (error) {
      console.error("❌ 보강/휴강 조회 오류:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      // 1️⃣ 해당 ID가 존재하는지 확인
      const [sessionExists] = await pool.execute("SELECT id FROM special_sessions WHERE id = ?", [id]);

      if (sessionExists.length === 0) {
        return 0; // ✅ 해당 ID가 존재하지 않으면 0 반환
      }

      // 2️⃣ 데이터 삭제
      const query = "DELETE FROM special_sessions WHERE id = ?";
      const [result] = await pool.execute(query, [id]);

      return result.affectedRows; // ✅ 삭제된 행 개수 반환
    } catch (error) {
      console.error("❌ 보강/휴강 삭제 오류:", error);
      throw error;
    }
  }
};
