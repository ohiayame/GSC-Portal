<template>
    <div class="calendar-container">
      <h1>SCHEDULE</h1>
      <iframe
        :src="calendarUrl"
        class="calendar-frame"
        frameborder="0"
        scrolling="no"
        ref="calendarIframe"
      ></iframe>
      <button @click="addEvent">일정 추가</button>  <!-- 버튼 클릭 시 addEvent() 실행 -->
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: "Schedule",
    data() {
      return {
        calendarUrl: "https://calendar.google.com/calendar/embed?src=c_c753ba6543d13ef5cb0ed145ae5bf376af1a129e3521e15b832c2befbd3636fa%40group.calendar.google.com&ctz=Asia%2FSeoul",
        accessToken: localStorage.getItem("accessToken") || "" // JWT 토큰 자동 반영
      };
    },
    methods: {
      async addEvent() {
        console.log("📌 addEvent() 실행됨!");  // 실행 확인용 로그
        if (!this.accessToken) {
          alert("로그인이 필요합니다!");
          return;
        }
  
        const event = {
          accessToken: this.accessToken,
          summary: "Vue에서 추가한 일정",
          start: "2025-03-01T09:00:00+09:00",
          end: "2025-03-01T10:30:00+09:00"
        };
  
        try {
          const response = await axios.post("http://localhost:5001/calendar/add-event", event);
          console.log("📌 일정 추가 결과:", response.data);  // 응답 로그
          alert("일정이 추가되었습니다!");
  
          // 📌 일정 추가 후 캘린더 새로고침
          this.reloadCalendar();
        } catch (error) {
          console.error("❌ 일정 추가 실패:", error);
          alert("일정 추가에 실패했습니다.");
        }
      },
      reloadCalendar() {
        // 📌 Google Calendar iFrame을 강제 새로고침
        this.$refs.calendarIframe.src += "";
      }
    }
  };
  </script>
  
  <style scoped>
  .calendar-container {
    text-align: center;
    margin-top: 20px;
  }
  .calendar-frame {
    width: 90%;
    max-width: 800px;
    height: 600px;
    border: 0;
  }
  button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  