import { SpecialSession } from '../models/SpecialSession.js';
import { findLineUsersWithCourseInfo } from '../models/lineLinkCodes.js';
import { sendLineMessage } from '../utils/lineMessenger.js';
import { insertEvent } from '../utils/googleCalendar.js';

// ✅ 전체 휴·보강 조회
export const getAllSpecialSessions = async (req, res) => {
  try {
    const specialSessions = await SpecialSession.findAll();
    res.json(specialSessions);
    // console.log(specialSessions);
  } catch (err) {
    console.error("🚨 휴·보강 조회 오류:", err);
    res.status(500).json({ error: "휴·보강 데이터를 불러오는 데 실패했습니다." });
  }
};


// ✅ 휴·보강 추가
export const createSpecialSession = async (req, res) => {
  try {
    const { course_id, course_name, type, date, start_period, duration, location , send_line } = req.body;
    // db저장
    const result = await SpecialSession.create(
      { course_id, type, date, start_period, duration, location }
    );

    // LINE 전송
    if (send_line) {
      // 1️⃣ 해당 과목 수강생 중 LINE 연동된 학생 조회
      const users = await findLineUsersWithCourseInfo(course_id);
      if (users.length === 0) {
        console.log("❗ LINE 연동된 수강생 없음");
      } else {
        // 📌 한 명만 대표로 course_name, grade 사용
        const typeLabel = type === '보강' ? '🔄 보강' : '❌ 휴강';
        const message = `${typeLabel} 알림

📚 과목: ${course_name}
📅 날짜: ${date}
🕒 ${start_period}교시 ~ ${start_period + duration - 1}교시
🏫 장소: ${location || '미정'}`;

        for (const user of users) {
          await sendLineMessage(user.line_id, message);
        }

        console.log(`✅ ${type} 메시지 ${users.length}명에게 발송 완료`);
      }
    }

    // 켈린더
    const typeLabel = type === '보강' ? '보강' : '휴강';
    const startHour = 9 + (start_period - 1); // 1교시 → 09:00
    const endHour = startHour + duration;

    const startDateTime = `${date}T${String(startHour).padStart(2, '0')}:00:00`;
    const endDateTime = `${date}T${String(endHour).padStart(2, '0')}:00:00`;
    const msg = `[${typeLabel}] ${course_name}`
    await insertEvent({
      summary: msg,
      location: location,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
    });


    res.status(201).json(result);
  } catch (err) {
    console.error("🚨 휴·보강 추가 오류:", err);
    res.status(500).json({ error: "휴·보강 추가에 실패했습니다." });
  }
};


// ✅ 휴·보강 삭제
export const deleteSpecialSession = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await SpecialSession.delete(id);

    if (!affectedRows) {
      return res.status(404).json({ error: "해당 휴·보강 데이터가 존재하지 않습니다." });
    }

    res.json({ message: "휴·보강 정보가 삭제되었습니다." });
  } catch (err) {
    console.error("🚨 휴·보강 삭제 오류:", err);
    res.status(500).json({ error: "휴·보강 삭제에 실패했습니다." });
  }
};
