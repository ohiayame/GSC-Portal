import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";

export const useTimetableStore = defineStore("timetable", {
  state: () => ({
    timetables: [], // 전체 시간표 데이터
    specialSessions: [], // 보강/휴강 데이터
    availableCourses: [], // 분반
    searchTarget: null,
    holidays: []
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
    initSearchTarget() {
      const auth = useAuthStore();
      if (auth.user && auth.user.grade) {
        this.searchTarget = auth.user.grade;
      } else {
        console.warn("❗️사용자 정보가 없어서 searchTarget 설정 실패");
      }
    },

    // ✅ 보강/휴강 데이터 불러오기
    // async fetchSpecialSessions() {
    //   try {
    //     const response = await fetch("http://localhost:3001/api/timetable/special");
    //     if (!response.ok) throw new Error("보강/휴강 데이터를 불러오는 데 실패했습니다.");
    //     this.specialSessions = await response.json();
    //   } catch (error) {
    //     console.error("🚨 보강/휴강 데이터 불러오기 오류:", error);
    //   }
    // },

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
    async updateTimetable(timetableData) {
      try {
        const response = await fetch(`http://localhost:3001/api/timetable/${timetableData.course_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(timetableData)
        });

        return response.data;
      } catch (error) {
        console.error("❌ 시간표 수정 실패:", error);
        return null;
      }
    },


    // ✅ 시간표 삭제
    async deleteTimetable(course_id) {
      try {
        const response = await fetch(`http://localhost:3001/api/courses/${course_id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("시간표 삭제 실패");
        this.timetables = this.timetables.filter(item => item.course_id !== course_id);
      } catch (error) {
        console.error("🚨 시간표 삭제 오류:", error);
      }
    },

    //
    async fetchAvailableCourses(grade) {
      try {
        const response = await fetch(`http://localhost:3001/api/courses/available?grade=${grade}`);
        if (!response.ok) throw new Error("과목 불러오기 실패");

        const data = await response.json();
        this.availableCourses = data;
      } catch (error) {
        console.error("❌ 사용 가능한 과목 조회 실패:", error);
      }
    },

    async fetchHolidays(year, month) {
      try {
        const response = await fetch(`http://localhost:3001/api/holidays/?year=${year}&month=${month}`);
        if (!response.ok) throw new Error("공휴일 불러오기 실패");

        const data = await response.json();
        this.holidays = data;
        console.log("Holiday data", data)
      } catch (error) {
        console.error("❌ 사용 가능한 공휴일 조회 실패:", error);
      }
    }

  },
});
