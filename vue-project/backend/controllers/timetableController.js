import Timetable from "../models/Timetable.js";

// ✅ 전체 시간표 조회
export const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.getAll();
    res.json(timetables);
  } catch (err) {
    console.error("🚨 시간표 조회 오류:", err);
    res.status(500).json({ error: "시간표를 불러오는 데 실패했습니다." });
  }
};

// ✅ 특정 학년 시간표 조회
export const getTimetableByGrade = async (req, res) => {
  try {
    const { grade } = req.params;
    console.log(`📌 요청된 학년: ${grade}`); // ✅ 요청받은 학년 확인

    // ✅ grade가 없거나 잘못된 값이면 오류 반환
    if (!grade) {
      console.error("🚨 오류: 학년 값이 없습니다.");
      return res.status(400).json({ error: "학년 값이 없습니다." });
    }

    // ✅ 데이터베이스에서 시간표 조회
    const timetables = await Timetable.getByGrade(grade);
    console.log(`📌 조회된 시간표 데이터 (${grade}학년):`, timetables);

    // ✅ 데이터가 없을 경우 경고 로그 출력
    if (timetables.length === 0) {
      console.warn(`⚠️ 경고: ${grade}학년의 시간표 데이터가 없습니다.`);
    }

    res.json(timetables);
  } catch (err) {
    console.error("🚨 특정 학년 시간표 조회 오류:", err);
    res.status(500).json({ error: "시간표를 불러오는 데 실패했습니다." });
  }
};

// ✅ 특정 과목 시간표 조회
export const getTimetableByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const timetables = await Timetable.getByCourse(course_id);
    res.json(timetables);
  } catch (err) {
    console.error("🚨 특정 과목 시간표 조회 오류:", err);
    res.status(500).json({ error: "시간표를 불러오는 데 실패했습니다." });
  }
};

// ✅ 시간표 추가
export const createTimetable = async (req, res) => {
  try {
    const { course_id, day, period, duration, location, start_date, end_date } = req.body;

    console.log("📌 요청된 시간표 데이터:", req.body); // 🔍 요청된 데이터 확인

    if (!course_id || !day || !period || !duration || !start_date || !end_date) {
      console.error("🚨 필수 데이터 누락됨!");
      return res.status(400).json({ error: "필수 입력값이 누락되었습니다." });
    }

    await Timetable.create({ course_id, day, period, duration, location, start_date, end_date });
    res.status(201).json({ message: "시간표 추가 완료" });
  } catch (error) {
    console.error("🚨 시간표 추가 오류:", error);
    res.status(500).json({ error: "시간표 추가 실패" });
  }
};



import Course from "../models/Courses.js";

// ✅ 과목과 시간표 모두 업데이트
export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, course_name, professor, grade, class_section, type,
            day, period, duration, location, start_date, end_date } = req.body;

    console.log("req.body data", req.body)
    // ✅ 과목 정보 수정 (course_id가 있는 경우)
    if (course_id) {
      const updatedCourseRows = await Course.update(course_id, {
        name: course_name,
        professor,
        grade,
        class_section,
        type,
      });

      if (!updatedCourseRows) {
        return res.status(404).json({ error: "해당 과목이 존재하지 않습니다." });
      }
    }

    // ✅ 시간표 정보 수정
    const updatedTimetableRows = await Timetable.update(id, {
      day,
      period,
      duration,
      location,
      start_date,
      end_date,
    });

    if (!updatedTimetableRows) {
      return res.status(404).json({ error: "해당 시간표가 존재하지 않습니다." });
    }

    res.json({ message: "✅ 과목 및 시간표 수정 완료!" });
  } catch (err) {
    console.error("🚨 시간표 및 과목 수정 오류:", err);
    res.status(500).json({ error: "시간표 및 과목 수정 실패" });
  }
};

