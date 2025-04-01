import { defineStore } from "pinia";
import axios from "axios";

export const useAssignLevelStore = defineStore("assignLevel", {
  state: () => ({
    status: null,
    group_id: null,
    selectedCourses: [], // 분반 과목 목록
    assignedCourses: [], // 분반 학생 목록
  }),
  actions: {
    async submitAssignments( assignments) {
      try {
        console.log("mode: ", this.mode)
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
  },
});
