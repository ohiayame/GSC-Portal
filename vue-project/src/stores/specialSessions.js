import { defineStore } from "pinia";

const API_BASE_URL = "http://localhost:3001/api/specialSession"; // ✅ 포트 확인

export const useSpecialSessionStore = defineStore("specialSessions", {
  state: () => ({
    sessions: [],
  }),
  actions: {
    // ✅ 보강/휴강 목록 가져오기
    async fetchSessions() {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error("보강/휴강 목록 불러오기 실패!");

        let data = await response.json();

        // ✅ 휴강을 먼저 정렬하고, 날짜순 정렬
        this.sessions = data.sort((a, b) => {
          if (a.type !== b.type) return a.type === "휴강" ? -1 : 1; // ✅ 휴강이 먼저
          return new Date(a.date) - new Date(b.date); // ✅ 날짜 오름차순 정렬
        });

      } catch (error) {
        console.error(error);
      }
    },

    // ✅ 보강/휴강 등록
    async addSession(sessionData) {
      try {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });

        if (!response.ok) throw new Error("보강/휴강 등록 실패!");

        const data = await response.json();
        this.sessions.push(data);
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    // ✅ 특정 보강/휴강 삭제
    async deleteSession(sessionId) {
      try {
        const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("보강/휴강 삭제 실패!");

        this.sessions = this.sessions.filter(session => session.id !== sessionId);
      } catch (error) {
        console.error(error);
      }
    }
  }
});
