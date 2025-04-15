import db from "../config/db.js";

export const getNextGroupId = async () => {
  const [rows] = await db.query(`SELECT MAX(group_id) as maxGroup FROM course_assignments`);
  return (rows[0].maxGroup || 0) + 1; // ❗ null 이면 0으로 처리
};
// 등록
export const insertCourseLevel = async (course_id, student_id, targetGroupId) => {
  console.log("id", targetGroupId)
  const sql = `
    INSERT INTO course_assignments (course_id, student_id, group_id)
    VALUES (?, ?, ?)
  `;
  await db.query(sql, [course_id, student_id, targetGroupId]);
};

// 삭제
export const deleteAssignmentsByGroupId = async (group_id) => {
  await db.query(`DELETE FROM course_assignments WHERE group_id = ?`, [group_id]);
};

// 특정 학생 조회
export const getAssignmentsCourse = async (student_id) =>{
  const [rows] = await db.query(
    `SELECT * FROM course_assignments WHERE student_id = ?`,
    [student_id]
  );
  return rows;
};

// 그룹 단위로 과목 조회
export const getGroupSummaries = async () => {
  const [rows] = await db.query(`
    SELECT ca.group_id, c.course_name, c.class_section
    FROM course_assignments ca
    JOIN courses c ON ca.course_id = c.course_id
    ORDER BY ca.group_id ASC
  `);

  // 👉 group_id별로 묶기
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.group_id]) {
      grouped[row.group_id] = [];
    }
    grouped[row.group_id].push({
      course_name: row.course_name,
      class_section: row.class_section,
    });
  }

  // 객체 → 배열 변환
  return Object.entries(grouped).map(([group_id, courses]) => ({
    group_id: Number(group_id),
    courses,
  }));
};

// group_id단위로 조회
export const getAssignmentsByGroupId = async (group_id) => {
  const [rows] = await db.query(
    `SELECT
        ca.course_id,
        ca.student_id,
        u.name AS student_name,
        c.course_name,
        c.class_section,
        c.grade AS course_grade,
        u.grade AS student_grade
      FROM course_assignments ca
      JOIN users u ON ca.student_id = u.id
      JOIN courses c ON ca.course_id = c.course_id
      WHERE ca.group_id = ?`,
    [group_id]
  );
  return rows;
};


export const getAllGroupAssignments = async () => {
  const [rows] = await db.query(`
    SELECT
      ca.group_id,
      ca.course_id,
      u.id AS student_id,
      u.name AS student_name,
      u.grade AS student_grade,
      c.course_name,
      c.class_section,
      c.grade AS course_grade
    FROM course_assignments ca
    JOIN users u ON ca.student_id = u.id
    JOIN courses c ON ca.course_id = c.course_id
    ORDER BY ca.group_id, ca.course_id;
  `);
  return rows;
};
