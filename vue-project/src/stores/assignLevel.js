import { defineStore } from "pinia";
import axios from "axios";

export const useAssignLevelStore = defineStore("assignLevel", {
  state: () => ({
    status: null,
    group_id: null,
    selectedGroupId: null,
    selectedCourses: [], // 분반 과목 목록
    assignedCourses: [], // 분반 학생 목록
    assigned: {}, // course_id별로 학생 리스트 저장
    groups: [], // 그룹 목록
  }),
  actions: {
    async submitAssignments( assignments) {
      try {
        const res = await axios.post("http://localhost:3001/api/assign-level", {
          assignments,
          group_id : this.group_id
        });

        alert("✅ 분반 정보가 서버에 저장되었습니다!");
        this.status = "success";
        return res.data;
      } catch (err) {
        this.status = "error";
        console.error(err);
      }
    },
    async fetchAssignedCourses(studentId) {
      try {
        const response = await fetch(`http://localhost:3001/api/assign-level/${studentId}`);
        if (!response.ok) throw new Error("배정된 과목 불러오기 실패");
        this.assignedCourses = await response.json(); // ✅ [{ course_id, student_id, group_id }]
      } catch (error) {
        console.error("🚨 배정 과목 불러오기 오류:", error);
      }
    },

    // 그룹 목록 조회
    async fetchGroupList() {
      try {
        const res = await fetch("http://localhost:3001/api/assign-level/groups");
        if (!res.ok) throw new Error("그룹 목록 조회 실패");
        const data = await res.json();
        this.groups = data;
        console.log("✅ 그룹 목록 불러오기 완료:", data);
      } catch (err) {
        console.error("🚨 그룹 목록 요청 실패:", err);
      }
    },


     // ✅ 그룹별 배정 정보 가져오기
    async fetchAssignmentsByGroup(groupId) {
        const res = await fetch(`http://localhost:3001/api/assign-level/group/${groupId}`);
        if (!res.ok) throw new Error("불러오기 실패");
        const rows = await res.json();

        const courseMap = {};
        const grouped = {};
        console.log("rows", rows)

        rows.forEach(({ course_id, course_name, class_section, grade, student_id, student_name }) => {
          console.log("GRADE",grade )
          if (!courseMap[course_id]) {
            courseMap[course_id] = { course_id, course_name, class_section, grade };
          }

          if (!grouped[course_id]) grouped[course_id] = [];
          grouped[course_id].push({ id: student_id, name: student_name, grade: grade });

        });

        this.selectedCourses = Object.values(courseMap); // ✅ 중복 제거한 과목 배열
        this.assigned = grouped;
        this.group_id = groupId;
      }
  },
});
