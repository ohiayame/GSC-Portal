import { randomBytes } from 'crypto';
import {
  findUserIdByCode,
  markCodeAsUsed,
  createLinkCode,
  checkExistingCode
  } from '../models/lineLinkCodes.js';
import { updateUserLineId } from '../models/Users.js';
import { sendLineMessage } from '../utils/lineMessenger.js';



// 라인 id 저장
export const handleWebhook = async (req, res) => {
  const events = req.body.events;
  if (!events || events.length === 0) return res.sendStatus(400);

  const event = events[0];
  // 입력 받은 userId, message
  const userId = event.source.userId;
  const userMessage = event.message?.text;
  console.log("userId", userId)
  console.log("userMessage", userMessage)
  if (!userId || !userMessage) return res.sendStatus(400);

  if (userMessage.length === 6) {
    const link = await findUserIdByCode(userMessage);

    if (!link) {
      await sendLineMessage(userId, "❌ 유효하지 않은 코드입니다.");
      return res.sendStatus(200);
    }
    // 사용자 id와 라인의 userId 저장장
    await updateUserLineId(link.user_id, userId);
    // 코드 사용됨을 저장장s
    await markCodeAsUsed(userMessage);
    await sendLineMessage(userId, "✅ 연동이 완료되었습니다!");
  }
  else{
    await sendLineMessage(userId, "❌ 6글자의 코드만 입력해주세요");
  }

  res.sendStatus(200);
};

// 코드 발급
export const issueLinkCode = async (req, res) => {
  const user_id = req.user.id; // JWT나 세션에서 유저 ID 확보
  console.log("user_id", user_id);

  // 이미 발급된 코드가 있으면 재사용
  const existing = await checkExistingCode(user_id);
  if (existing) {
    return res.json({ code: existing.code });
  }

  // 새 코드 발급
  const code = randomBytes(3).toString('hex').toUpperCase(); // 예: '7A3F1C'
  console.log("code", code);
  await createLinkCode(user_id, code);

  res.json({ code });
};
