// 📌 stores/notices.js
import { defineStore } from "pinia";

export const useNoticesStore = defineStore("notices", {
  state: () => ({
    notices: [], // 공지사항 목록 저장
    searchKeyword: "",
    searchTarget: 0,
    searchCourse: ""
  }),
  actions: {
    // ✅ 공지사항 목록 불러오기
    async fetchNotices() {
      try {
        const response = await fetch("http://localhost:3001/api/notices");
        if (!response.ok) throw new Error("공지사항을 불러오는 데 실패했습니다.");
        const data = await response.json();
        console.log("📌 불러온 데이터:", data); // ✅ 데이터 확인 로그 추가
        this.notices = data;
      } catch (error) {
        console.error("🚨 공지사항 불러오기 실패:", error);
      }
    },

    // ✅ 검색 필드 업데이트
    setSearchKeyword(keyword) {
      this.searchKeyword = keyword;
    },

    setSearchTarget(target) {
      this.searchTarget = target;
    },

    setSearchCourses(courses) {
      this.searchCourse = courses;
    },

    // ✅ 특정 공지사항 가져오기 (store에서 찾기)
    getNoticeById(id) {
      return this.notices.find(notice => notice.id == id);
    },

    getTargetLabel(target) {
      return target === 0 ? "전체"
            : target === 1 ? "1학년"
            : target === 2 ? "2학년"
            : target === 3 ? "3학년"
            : target === 4 ? "한국어 및 특강"
            : "알 수 없음";
    },

    getFileUrl(filePath) {
      if (!filePath) return ""; // 파일이 없으면 빈 문자열 반환
      return `http://localhost:3001/api/notices/${filePath}`;
    },

    async uploadFile(file) {
      if (!file) {
        console.log("🚨 파일이 없습니다.");
        return null;
      }
      console.log("🚨 파일 name" , file.name);
      const formData = new FormData();
      formData.append("file", file);
      console.log("🚨 파일" , formData.get("file"));

      try {
        const response = await fetch("http://localhost:3001/api/notices/upload", {
          method: "POST",
          body: formData,
        });

        console.log("📌 서버 응답 상태 코드:", response.status); // ✅ 응답 코드 확인
        if (!response.ok) throw new Error(`파일 업로드 실패: ${response.status}`);

        const data = await response.json();
        console.log("📌 서버 응답 (파일 업로드):", data);
        return data.file_url || ""; // ✅ 업로드된 파일 URL 반환

      } catch (error) {
        console.error("🚨 파일 업로드 오류:", error);
        return null;
      }
    },

    // ✅ 공지사항 추가
    async addNotice(newNotice) {
      try {
        console.log("📌 보낼 데이터:", newNotice);

        const response = await fetch("http://localhost:3001/api/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNotice),
        });

        if (!response.ok) throw new Error("공지사항 추가 실패");
        const createdNotice = await response.json();
        this.notices.push(createdNotice); // ✅ store에 데이터 추가
      } catch (error) {
        console.error("🚨 공지사항 추가 오류:", error);
      }
    },

    // ✅ 공지사항 수정 (추가된 기능)
    async updateNotice(id, updatedNotice) {
      try {

        const response = await fetch(`http://localhost:3001/api/notices/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedNotice),
        });

        if (!response.ok) throw new Error("공지사항 수정 실패");

        // ✅ store 내 데이터 업데이트
        const index = this.notices.findIndex(notice => notice.id == id);
        if (index !== -1) {
          this.notices[index] = { ...this.notices[index], ...updatedNotice };
        }
      } catch (error) {
        console.error("🚨 공지사항 수정 오류:", error);
      }
    },

    // ✅ 공지사항 삭제
    async deleteNotice(id) {
      try {
        const response = await fetch(`http://localhost:3001/api/notices/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("공지사항 삭제 실패");
        this.notices = this.notices.filter(notice => notice.id !== id); // ✅ 삭제 후 store 업데이트
      } catch (error) {
        console.error("🚨 공지사항 삭제 중 오류:", error);
      }
    },
  }
});
