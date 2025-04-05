import db from '../config/db.js';

// 입력 코드 조회회
export const findUserIdByCode = async (code) => {
  const [rows] = await db.query(
    `SELECT user_id FROM line_link_codes WHERE
    code = ? AND used = 0`,
    [code]
  );
  return rows[0];
};

// 사용됨을 저장
export const markCodeAsUsed = async (code) => {
  await db.query(
    `UPDATE line_link_codes SET used = 1 WHERE code = ?`,
    [code]);
};

// 코드 생성성
export const createLinkCode = async (user_id, code) => {
  await db.query(
    `INSERT INTO line_link_codes (user_id, code) VALUES (?, ?)`,
    [user_id, code]
  );
};


// 기존 코드 삭제
export const deleteLinkCodeByUserId = async (user_id) => {
  const q = `DELETE FROM line_link_codes WHERE user_id = ?`;
  await db.query(q, [user_id]);
};

export const findLineUsersWithCourseInfo = async (course_id) => {
  // 1️⃣ 해당 과목 정보 조회
  const [courseRows] = await db.execute(`
    SELECT grade, class_section, course_name
    FROM courses
    WHERE course_id = ?
  `, [course_id]);

  if (courseRows.length === 0) throw new Error('과목이 존재하지 않습니다.');

  const course = courseRows[0];

  // 2️⃣ 분반이 있는 경우: course_assignments에서 찾기
  if (course.class_section !== null) {
    const [assignedUsers] = await db.execute(`
      SELECT u.line_id, c.course_name, c.grade
      FROM course_assignments ca
      JOIN courses c ON ca.course_id = c.course_id
      JOIN users u ON ca.student_id = u.id
      WHERE ca.course_id = ? AND u.line_id IS NOT NULL
    `, [course_id]);

    return assignedUsers;
  }

  // 3️⃣ 분반이 없는 경우: 학년 기준으로 사용자 조회
  const [usersByGrade] = await db.execute(`
    SELECT line_id, name, grade
    FROM users
    WHERE grade = ? AND line_id IS NOT NULL
  `, [course.grade]);

  return usersByGrade.map(u => ({
    ...u,
    course_name: course.course_name,
    grade: course.grade
  }));
};
