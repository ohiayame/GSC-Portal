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
