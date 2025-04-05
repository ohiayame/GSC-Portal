import db from '../config/db.js';

// ✅ 이메일로 사용자 조회
export const findUserByEmail = async (email) => {
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("❌ DB 조회 오류:", error.message);
        throw error;
    }
};

export const findAllUsers  = async () => {
  const [rows] = await db.query("SELECT * FROM users");
  return rows;
};

// ✅ 사용자 승인 (approved = 1)
export const approveUserById = async (id) => {
  await db.execute("UPDATE users SET approved = 1 WHERE id = ?", [id]);
};

// ✅ 사용자 거절 (삭제)
export const deleteUserById = async (id) => {
  await db.execute("DELETE FROM users WHERE id = ?", [id]);
};

// ✅ 사용자 추가
export const createUser = async (name, student_id, grade, email, phone, international) => {
    try {
        await db.query(`
            INSERT INTO users (name, student_id, grade, email, phone, international)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [name, student_id, grade, email, phone, international]
        );
    } catch (error) {
        console.error("❌ 회원가입 DB 오류:", error.message);
        throw error;
    }
};

export const updateRole = async (id, role) => {
  await db.execute("UPDATE users SET role = ? WHERE id = ?",
    [role, id]);
};


// line_id 저장
export const updateUserLineId = async (userId, lineId) => {
  await db.query(`UPDATE users SET line_id = ? WHERE id = ?`, [lineId, userId]);
};

// 사용자의 라인 id 조회
export async function findLineUsersByTarget(target) {
  let condition = '';
  const params = [];

  if (target !== 0) {
    condition = 'WHERE grade = ? AND line_id IS NOT NULL';
    params.push(target);
  } else {
    condition = 'WHERE line_id IS NOT NULL';
  }

  const [rows] = await db.query(`SELECT id, name, line_id FROM users ${condition}`, params);
  return rows;
}
