import db from "../config/db.js";

export const insertCourseLevel = async (course_id, student_id) => {
  const sql = `
    INSERT INTO course_assignments (course_id, student_id)
    VALUES (?, ?)
  `;
  await db.query(sql, [course_id, student_id]);
};
