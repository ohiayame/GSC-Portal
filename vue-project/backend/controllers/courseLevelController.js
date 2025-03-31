import { getNextGroupId, insertCourseLevel, deleteAssignmentsByCourseId, getAssignmentsCourse } from "../models/course_level.js";

export const saveAssignments = async (req, res) => {
  try {
    const { assignments, group_id } = req.body; // assignments = [{ student_id, class_section }]
    console.log("assignments: ", assignments)
    console.log("mode:", group_id)
    if (!assignments || assignments.length === 0) {
      return res.status(400).json({ message: "배정 데이터 없음" });
    }
    let targetGroupId = group_id;

    if (!targetGroupId){
      // id 새로 생성
      const targetGroupId = await getNextGroupId();
      console.log("👉 새 group_id:", targetGroupId);
    }else{
      // 해당 group_id의 항목 삭제
      const courseIds = [...new Set(assignments.map(a => a.course_id))];
      for (const id of courseIds) {
        await deleteAssignmentsByCourseId(id);
      }
      console.log("✏️ 기존 배정 삭제 완료");
    }
    // 등록
    for (const { student_id, course_id } of assignments) {
      await insertCourseLevel(course_id, student_id, targetGroupId );
    }
    res.status(200).json({ message: "배정 완료" });

  } catch (err) {
    console.error("배정 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};
export const getAssignments = async (req, res) => {
  console.log("id: ", req.params )
  const { studentId } = req.params;

  try {
    const rows = await getAssignmentsCourse(studentId);
    console.log("row: ", rows)
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ 배정된 과목 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};
