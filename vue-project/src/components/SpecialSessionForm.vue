<template>
  <div class="special-session-container">
    <h2>{{ form.type }} 등록</h2>
    <form @submit.prevent="submitForm">

      <!-- ✅ 보강 등록: 학년 & 수업 선택 -->
      <div v-if="form.type === '보강'">
        <div class="form-group">
          <label>학년:</label>
          <select v-model="selectedGrade" class="input-field" @change="fetchCourses">
            <option value="" disabled>학년 선택</option>
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
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

      <!-- ✅ 버튼 -->
      <div class="button-container">
        <button type="button" class="back" @click="$router.push('/timetable')">돌아가기</button>
        <button type="submit" class="register">등록</button>
      </div>

    </form>
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
    });

    const selectedGrade = ref(""); // 학년 선택
    const filteredCourses = ref([]); // 선택한 학년의 수업 목록

    // ✅ 페이지 진입 시 query에서 데이터 가져와서 기본값 설정
    onMounted(() => {
      const { course_id, course_name, date, start_period, duration, type} = route.query;
      if (course_id) {
        form.value.course_id = course_id;
        form.value.course_name = course_name;
        form.value.start_period = start_period;
        form.value.duration = duration;
        form.value.type = type || "보강";
        form.value.date = date || "";
      }
    });


    // ✅ 선택한 학년의 수업 목록 가져오기
    const fetchCourses = () => {
      if (!selectedGrade.value) {
        filteredCourses.value = [];
        return;
      }
      filteredCourses.value = timetableStore.timetables.filter(
        (course) => course.grade == selectedGrade.value
      );
    };

    // ✅ 선택한 수업의 이름을 자동으로 업데이트
    const updateCourseName = () => {
      const selectedCourse = filteredCourses.value.find(
        (course) => course.course_id == form.value.course_id
      );
      form.value.course_name = selectedCourse ? selectedCourse.course_name : "";
    };

    // ✅ 등록 버튼 클릭 시 API 호출
    const submitForm = async () => {
      try {
        // 🚀 디버깅용 콘솔 출력
        console.log("🚀 등록 요청 데이터:", form.value);

        // ✅ 필수 데이터 확인 (course_id, date)
        if (!form.value.course_id || !form.value.date) {
          alert("📌 과목과 날짜를 입력해주세요!");
          return;
        }

        await specialSessionStore.addSession(form.value);

        alert("등록 완료!");
        router.push("/timetable");
      } catch (error) {
        console.error("❌ 등록 실패!", error);
        alert("등록 실패!");
      }
    };

    return {
      form,
      submitForm,
      selectedGrade,
      filteredCourses,
      fetchCourses,
      updateCourseName,
    };
  },
};
</script>

<style scoped>
.special-session-container {
  width: 500px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.special-session-container h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.input-field {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.inline-group {
  display: flex;
  gap: 10px;
}

.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button.back {
  background-color: #ccc;
  color: black;
}

button.back:hover {
  background-color: #b3b3b3;
}

button.register {
  background-color: #485ff7;
  color: white;
  border: none;
}

button.register:hover {
  background-color: #5fb7ff;
}
</style>
