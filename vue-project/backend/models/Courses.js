import db from "../config/db.js";

const Course = {
  // ✅ 과목 추가
  async create({ name, professor, grade, class_section, type }) {
    const [result] = await db.query(
      "INSERT INTO courses (name, professor, grade, class_section, type) VALUES (?, ?, ?, ?, ?)",
      [name, professor || "정영철", grade, class_section || 1, type || "regular"]
    );
    return result.insertId;
  },

  // ✅ 과목 목록 조회
  async getAll() {
    const [rows] = await db.query("SELECT * FROM courses");
    return rows;
  },
};

export default Course;
