import db from "../config/db.js";

export const insertRefreshToken = async (user_id, token, expires_at) => {
  await db.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [user_id, token, expires_at]
  );
};

export const findRefreshToken = async (token) => {
  const [rows] = await db.query("SELECT * FROM refresh_tokens WHERE token = ?", [token]);
  return rows[0];
};

export const deleteRefreshToken = async (token) => {
  await db.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
};
