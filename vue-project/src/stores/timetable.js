import { defineStore } from "pinia";

export const useTimetableStore = defineStore("timetable", {
  state: () => ({
    timetables: [], // 전체 시간표 데이터
    specialSessions: [], // 보강/휴강 데이터
    searchTarget: 1,
  }),

  actions: {
    // ✅ 시간표 목록 불러오기
    async fetchTimetables() {
      try {
        const response = await fetch(`http://localhost:3001/api/timetable`);
        if (!response.ok) throw new Error("시간표 데이터를 불러오는 데 실패했습니다.");
        this.timetables = await response.json();
      } catch (error) {
        console.error("🚨 시간표 불러오기 오류:", error);
      }
    },
    setSearchTarget(target) {
      this.searchTarget = target;
    },

    // ✅ 보강/휴강 데이터 불러오기
    async fetchSpecialSessions() {
      try {
        const response = await fetch("http://localhost:3001/api/timetable/special");
        if (!response.ok) throw new Error("보강/휴강 데이터를 불러오는 데 실패했습니다.");
        this.specialSessions = await response.json();
      } catch (error) {
        console.error("🚨 보강/휴강 데이터 불러오기 오류:", error);
      }
    },

    // ✅ 시간표 추가
    async addCourse(courseData) {
      try {
        const response = await fetch("http://localhost:3001/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        });

        if (!response.ok) throw new Error("과목 추가 실패");

        const result = await response.json();
        return result; // ✅ course_id 반환
      } catch (error) {
        console.error("🚨 과목 추가 오류:", error);
        return null; // 오류 발생 시 null 반환
      }
    },

    async addTimetable(timetableData) {
      await fetch("http://localhost:3001/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timetableData),
      });
    },

    // ✅ 시간표 수정 (새로운 함수 추가)
    async updateTimetable(updatedTimetable) {
      try {
        const response = await fetch(`http://localhost:3001/api/timetables/${updatedTimetable.course_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTimetable),
        });

        if (!response.ok) throw new Error("시간표 수정 실패!");

        const updatedData = await response.json();

        // ✅ 기존 시간표 리스트에서 업데이트된 항목 반영
        const index = this.timetables.findIndex(t => t.course_id === updatedTimetable.course_id);
        if (index !== -1) {
          this.timetables[index] = updatedData;
        }

        return updatedData;
      } catch (error) {
        console.error("🚨 시간표 수정 오류:", error);
        throw error;
      }
    },


    // ✅ 시간표 삭제
    async deleteTimetable(id) {
      try {
        const response = await fetch(`http://localhost:3001/api/courses/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("시간표 삭제 실패");
        this.timetables = this.timetables.filter(item => item.id !== id);
      } catch (error) {
        console.error("🚨 시간표 삭제 오류:", error);
      }
    },
  },
});
