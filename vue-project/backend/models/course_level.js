import db from "../config/db.js";

export const getNextGroupId = async () => {
  const [rows] = await db.query(`SELECT MAX(group_id) as maxGroup FROM course_assignments`);
  return (rows[0].maxGroup || 0) + 1; // ❗ null 이면 0으로 처리
};

export const insertCourseLevel = async (course_id, student_id, group_id) => {
  console.log("id", group_id)
  const sql = `
    INSERT INTO course_assignments (course_id, student_id, group_id)
    VALUES (?, ?, ?)
  `;
  await db.query(sql, [course_id, student_id, group_id]);
};


export const deleteAssignmentsByCourseId = async (course_id) => {
  await db.query(`DELETE FROM course_assignments WHERE course_id = ?`, [course_id]);
};

export const getAssignmentsCourse = async (student_id) =>{
  const [rows] = await db.query(
    `SELECT * FROM course_assignments WHERE student_id = ?`,
    [student_id]
  );
  return rows;
};
