import pool from "../config/db.js"; // ✅ DB 연결 가져오기

export const SpecialSession = {
  // ✅ 새로운 보강/휴강 데이터 추가 (INSERT INTO)
  async create(sessionData) {
    const { course_id, date, type, start_period, duration, location } = sessionData;

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
      const query = "SELECT * FROM special_sessions";
      const [results] = await pool.execute(query); // ✅ pool 사용
      return results;
    } catch (error) {
      console.error("❌ 보강/휴강 조회 오류:", error);
      throw error;
    }
  },
};
