<template>
  <div class="page">
  <div class="special-session-form">
    <h2>{{ form.type }} 등록</h2>
    <form @submit.prevent="submitForm">

      <!-- ✅ 보강 등록: 학년 & 수업 선택 -->
      <div v-if="form.type === '보강'">
        <div class="form-group">
          <label>학년:</label>
          <select v-model="selectedGrade" class="input-field" @change="fetchCourses">
            <option value="" disabled>학년 선택</option>
            <option value="0">특강</option>
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
            <option value="4">한국어</option>
          </select>
        </div>

        <div class="form-group">
          <label>수업 선택:</label>
          <select v-model="form.course_id" class="input-field" @change="updateCourseName">
            <option value="" disabled>과목 선택</option>
            <option v-for="course in filteredCourses" :key="course.course_id" :value="course.course_id">
              {{ course.course_name }} ({{ course.professor }})
            </option>
          </select>
        </div>
      </div>

      <!-- ✅ 휴강 등록: 과목명 자동 입력 -->
      <div class="form-group" v-else>
        <label>과목명:</label>
        <input type="text" v-model="form.course_name" class="input-field" disabled />
      </div>

      <!-- ✅ 날짜 선택 -->
      <div class="form-group">
        <label>날짜:</label>
        <input type="date" v-model="form.date" class="input-field" />
      </div>

      <div class="inline-group">
        <div class="form-group">
          <label>시작 교시:</label>
          <input type="number" v-model="form.start_period" class="input-field" />
        </div>

        <div class="form-group">
          <label>지속 시간:</label>
          <input type="number" v-model="form.duration" class="input-field" />
        </div>
      </div>

      <!-- ✅ 보강 선택 시 추가 입력 필드 -->
      <div v-if="form.type === '보강'">
        <div class="form-group">
          <label>강의실:</label>
          <input type="text" v-model="form.location" class="input-field" />
        </div>
      </div>

      <!-- ✅ LINE 전송 스위치 -->
      <div class="line-toggle">
        <label class="line-switch">
          <input type="checkbox" v-model="form.send_line" />
          <span class="slider"></span>
        </label>
        <span>LINE 메시지 전송</span>
      </div>

      <!-- ✅ 버튼 -->
      <div class="button-container">
        <button type="button" class="back" @click="goBack">돌아가기</button>
        <button type="submit" class="register">등록</button>
      </div>

    </form>
  </div>
</div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSpecialSessionStore } from "../stores/specialSessions";
import { useTimetableStore } from "../stores/timetable";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const specialSessionStore = useSpecialSessionStore();
    const timetableStore = useTimetableStore();

    const form = ref({
      course_id: null,
      course_name: "",
      date: "",
      type: "보강",
      start_period: null,
      duration: null,
      location: "",
      grade: "",
      send_line: true
    });

    const selectedGrade = ref("");
    const filteredCourses = ref([]);

    // ✅ 페이지 진입 시 데이터 가져오기
    onMounted(() => {
      const { course_id, course_name, date, start_period, duration, type, grade } = route.query;
      if (course_id) {
        form.value.course_id = course_id;
        form.value.course_name = course_name;
        form.value.start_period = Number(start_period);
        form.value.duration = Number(duration);
        form.value.type = type || "보강";
        form.value.date = date || "";
        form.value.grade = grade || "";
      }
    });

    // ✅ 학년 선택 시 해당 학년의 과목 목록 가져오기
    const fetchCourses = () => {
      if (!selectedGrade.value) {
        filteredCourses.value = [];
        return;
      }
      filteredCourses.value = timetableStore.timetables.filter(course => course.grade == selectedGrade.value);

      console.log("📌 선택된 학년:", selectedGrade.value);
      console.log("📌 필터링된 과목 목록:", filteredCourses.value);
    };

    // ✅ 선택한 과목 정보 자동 업데이트
    const updateCourseName = () => {
      const selectedCourse = filteredCourses.value.find(course => course.course_id == form.value.course_id);
      if (selectedCourse) {
        form.value.course_name = selectedCourse.course_name;
        form.value.start_period = selectedCourse.period;
        form.value.duration = selectedCourse.duration;
        form.value.location = selectedCourse.location;
        form.value.grade = selectedCourse.grade;
      }
      console.log("📌 선택된 과목 정보:", form.value);
    };

    // ✅ 등록 버튼 클릭 시 유효성 검사 후 API 호출
    const submitForm = async () => {
      try {
        console.log("🚀 등록 요청 데이터:", form.value);

        // ✅ 필수 데이터 확인
        if (!form.value.course_id || !form.value.date) {
          alert("📌 과목과 날짜를 입력해주세요!");
          return;
        }

        // ✅ 1. 저장하려는 과목의 start_date, end_date 기간 확인
        const selectedCourse = timetableStore.timetables.find(course => course.course_id == form.value.course_id);
        if (!selectedCourse) {
          alert("📌 선택한 과목이 존재하지 않습니다!");
          return;
        }

        const selectedDate = new Date(form.value.date);
        const startDate = new Date(selectedCourse.start_date);
        const endDate = new Date(selectedCourse.end_date);

        if (selectedDate < startDate || selectedDate > endDate) {
          alert(`📌 해당 과목의 유효한 기간은 ${selectedCourse.start_date} ~ ${selectedCourse.end_date} 입니다!`);
          return;
        }

        // ✅ 2. 보강 등록 시 기존 시간표와 겹치는지 확인
        if (form.value.type === "보강") {
          const existingSessions = timetableStore.timetables.concat(specialSessionStore.sessions);

          const isConflict = existingSessions.some(session => {
            return (
              session.course_id !== form.value.course_id &&  // 같은 과목은 허용
              session.date === form.value.date &&
              session.start_period < form.value.start_period + form.value.duration &&
              form.value.start_period < session.start_period + session.duration &&
              session.type !== "휴강" // 휴강은 무시
            );
          });

          if (isConflict) {
            alert("📌 선택한 시간에 이미 수업이 있습니다!");
            return;
          }
        }

        // ✅ 모든 조건을 통과하면 저장
        await specialSessionStore.addSession(form.value);
        alert("등록 완료!");
        router.push("/timetable");
      } catch (error) {
        console.error("❌ 등록 실패!", error);
        alert("등록 실패!");
      }
    };

    const goBack = () => {
      router.back();
    };

    return {
      form,
      submitForm,
      selectedGrade,
      filteredCourses,
      fetchCourses,
      updateCourseName,
      goBack,
    };
  },
};
</script>

<style scoped>
.page {
  background: linear-gradient(135deg, #f0f5ff, #e8f0ff);
  height: 100vh;
}

.special-session-form {
  max-width: 800px;
  margin: 0px auto;
  margin-bottom: 200px;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.137);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.special-session-form h2 {
  text-align: center;
  font-size: 24px;
  font-weight: 800;
  color: #3ca1ff;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.input-field,
.form-group select {
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 8px;
  background-color: #f6faff;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.input-field:focus,
.form-group select:focus {
  border-color: #4d8eff;
  outline: none;
}

.inline-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.inline-group .form-group {
  flex: 1;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

button {
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

button.back {
  background-color: #ccc;
  color: #333;
}

button.back:hover {
  background-color: #b1b1b1;
}

button.register {
  background-color: #3ca1ff;
  color: white;
  border: none;
  box-shadow: 0 3px 10px rgba(60, 161, 255, 0.2);
}

button.register:hover {
  background-color: #1d8fff;
}

.line-toggle {
  display: flex;
  align-items: center;
  margin-top: 16px;
}

.line-switch {
  position: relative;
  width: 40px;
  height: 20px;
  margin-right: 10px;
}

.line-switch input {
  display: none;
}

.slider {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  border-radius: 20px;
  transition: background-color 0.3s;
}

input:checked + .slider {
  background-color: #2dbfbe;
}

.slider::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  left: 2px;
  top: 2px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

input:checked + .slider::before {
  transform: translateX(20px);
}

</style>
