import { defineStore } from "pinia";
import axios from "axios";

export const useAssignLevelStore = defineStore("assignLevel", {
  state: () => ({
    status: null,
    mode: null,
    selectedCourses: [],
  }),
  actions: {
    async submitAssignments( assignments) {
      try {
        const res = await axios.post("http://localhost:3001/api/assign-level", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignments,
            mode: this.mode
          }),
        });
        alert("✅ 분반 정보가 서버에 저장되었습니다!");
        this.status = "success";
        return res.data;
      } catch (err) {
        this.status = "error";
        console.error(err);
      }
    },
  },
});
