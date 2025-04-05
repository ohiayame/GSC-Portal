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

// 사용자의 코드 조회
export const checkExistingCode = async (user_id) => {
  const [rows] = await db.query(
    `SELECT code FROM line_link_codes WHERE user_id = ? AND used = 0`,
    [user_id]
  );
  return rows[0]; // 있으면 기존 코드 반환
};
