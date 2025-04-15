import { getNextGroupId, insertCourseLevel,
  deleteAssignmentsByGroupId, getAssignmentsCourse,
  getGroupSummaries, getAssignmentsByGroupId, getAllGroupAssignments } from "../models/course_level.js";

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
      targetGroupId = await getNextGroupId();
      console.log("👉 새 group_id:", targetGroupId);

    }else{
      // 해당 group_id의 항목 삭제
      await deleteAssignmentsByGroupId(targetGroupId);
      console.log("✏️ 기존 배정 삭제 완료");
    }
    // 등록
    for (const { student_id, course_id } of assignments) {
      console.log("targetGroupId", targetGroupId)
      await insertCourseLevel(course_id, student_id, targetGroupId );
    }
    res.status(200).json({ message: "배정 완료" });

  } catch (err) {
    console.error("배정 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};
// 특정 학생 조회
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

// 그룹 과목 등록 여부 조회
export const getGroupList = async (req, res) => {
  try {
    const groups = await getGroupSummaries();
    res.status(200).json(groups);
  } catch (err) {
    console.error("❌ 그룹 목록 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// groupId단위 조회
export const getAssignmentsByGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const rows = await getAssignmentsByGroupId(groupId);
    console.log("rows", rows)
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ 그룹 배정 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

export const getAllGroupAssignmentsHandler = async (req, res) => {
  try {
    const rows = await getAllGroupAssignments();

    const result = {};

    for (const row of rows) {
      const gid = row.group_id;
      if (!result[gid]) result[gid] = [];

      result[gid].push({
        id: row.student_id,
        name: row.student_name,
        grade: row.student_grade,
        course_name: row.course_name,
        class_section: row.class_section
      });
    }

    const formatted = Object.entries(result).map(([group_id, students]) => ({
      group_id: Number(group_id),
      students
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("❌ 그룹 통합 출력 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};
