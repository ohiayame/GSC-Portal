import {
  getAllAllowedEmails,
  insertAllowedEmail,
  deleteAllowedEmail,
  findAllowedEmail
} from '../models/allowedEmails.js';

// 🔹 1. 전체 이메일 목록 조회
export const getAll = async (req, res) => {
  try {
    const emails = await getAllAllowedEmails();
    res.status(200).json(emails);
  } catch (err) {
    console.error('❌ 이메일 목록 조회 실패:', err);
    res.status(500).json({ error: '허용 이메일 목록 조회 실패' });
  }
};

// 🔹 2. 이메일 추가
export const add = async (req, res) => {
  const { email, memo } = req.body;
  console.log("add -> req.body", req.body)

  if (!email) {
    return res.status(400).json({ error: '이메일을 입력해주세요.' });
  }

  try {
    const exists = await findAllowedEmail(email);
    if (exists) {
      return res.status(409).json({ error: '이미 등록된 이메일입니다.' });
    }

    await insertAllowedEmail(email, memo);
    res.status(201).json({ message: '이메일 추가 완료', email });
  } catch (err) {
    console.error('❌ 이메일 추가 실패:', err);
    res.status(500).json({ error: '이메일 추가 실패' });
  }
};

// 🔹 3. 이메일 삭제
export const remove = async (req, res) => {
  const { email } = req.params;

  try {
    await deleteAllowedEmail(email);
    res.status(200).json({ message: '이메일 삭제 완료', email });
  } catch (err) {
    console.error('❌ 이메일 삭제 실패:', err);
    res.status(500).json({ error: '이메일 삭제 실패' });
  }
};
