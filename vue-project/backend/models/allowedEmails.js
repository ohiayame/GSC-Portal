import db from '../config/db.js'; // DB 커넥션 불러오기

export async function findAllowedEmail(email) {
  const [rows] = await db.query("SELECT * FROM allowed_emails WHERE email = ?", [email]);
  return rows[0];
}

export async function insertAllowedEmail(email) {
  return db.query("INSERT INTO allowed_emails (email) VALUES (?)", [email]);
}

export async function deleteAllowedEmail(email) {
  return db.query("DELETE FROM allowed_emails WHERE email = ?", [email]);
}

export async function getAllAllowedEmails() {
  const [rows] = await db.query("SELECT * FROM allowed_emails ORDER BY created_at DESC");
  return rows;
}
