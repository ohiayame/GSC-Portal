<script setup>
import { ref } from "vue";
import { useTimetableStore } from "../stores/timetable";
import { useRouter } from "vue-router";

const store = useTimetableStore();
const router = useRouter();

const course_name = ref("");
const professor = ref("");
const grade = ref(1);
const class_section = ref(1);
const type = ref("regular");

const day = ref("");
const period = ref("");
const duration = ref("");
const location = ref("");
const start_date = ref("");
const end_date = ref("");

const saveTimetable = async () => {
  if (!course_name.value || !day.value || !period.value || !duration.value) {
    alert("모든 필수 항목을 입력하세요!");
    return;
  }

  // 1️⃣ 과목 정보 저장 후 `course_id` 받기
  const courseData = {
    name: course_name.value,
    professor: professor.value || "정영철",
    grade: grade.value,
    class_section: class_section.value,
    type: type.value,
  };

  const courseResponse = await store.addCourse(courseData);
  if (!courseResponse || !courseResponse.id) {
    alert("과목 추가에 실패했습니다.");
    return;
  }
  console.log("📌 courseResponse:", courseResponse);

  const course_id = courseResponse.id;
  console.log("📌 저장된 course_id:", course_id);
  if (!course_id) {
    console.error("🚨 course_id를 가져오는 데 실패했습니다.");
    alert("과목 정보를 추가하는 데 실패했습니다.");
    return;
  }
  // 2️⃣ 시간표 저장
  const timetableData = {
    course_id,
    day: day.value,
    period: period.value,
    duration: duration.value,
    location: location.value,
    start_date: start_date.value,
    end_date: end_date.value,
  };

  await store.addTimetable(timetableData);
  router.push("/timetable");
};
</script>


<template>
  <div class="timetable-form">
    <h2>시간표 등록</h2>

    <!-- 새로운 과목 입력 -->
    <div class="form-group">
      <label for="course_name">과목명</label>
      <input id="course_name" type="text" v-model="course_name" placeholder="과목 입력" />
    </div>

    <div class="form-group">
      <label for="professor">교수</label>
      <input id="professor" type="text" v-model="professor" placeholder="정영철" />
    </div>

    <div class="inline-group">
      <div class="form-group">
        <label for="grade">학년</label>
        <select id="grade" v-model="grade">
          <option :value="1">1학년</option>
          <option :value="2">2학년</option>
          <option :value="3">3학년</option>
        </select>
      </div>

      <div class="form-group">
        <label for="class_section">분반</label>
        <input id="class_section" type="number" v-model="class_section" min="1" />
      </div>
    </div>

    <div class="form-group">
      <label for="day">요일</label>
      <select id="day" v-model="day">
        <option>월</option>
        <option>화</option>
        <option>수</option>
        <option>목</option>
        <option>금</option>
      </select>
    </div>

    <div class="inline-group">
      <div class="form-group">
        <label for="period">시작 교시</label>
        <input id="period" type="number" v-model="period" min="1" />
      </div>

      <div class="form-group">
        <label for="duration">수업 시간</label>
        <input id="duration" type="number" v-model="duration" min="1" />
      </div>
    </div>

    <div class="form-group">
      <label for="location">강의실</label>
      <input id="location" type="text" v-model="location" placeholder="강의실 입력" />
    </div>

    <div class="inline-group">
      <div class="form-group">
        <label for="start_date">개강일</label>
        <input id="start_date" type="date" v-model="start_date" />
      </div>

      <div class="form-group">
        <label for="end_date">종강일</label>
        <input id="end_date" type="date" v-model="end_date" />
      </div>
    </div>

    <div class="button-container">
      <button @click="router.push('/timetable')" class="back">돌아가기</button>
      <button @click="saveTimetable" class="register">등록</button>
    </div>
  </div>
</template>


<style scoped>
.timetable-form {
  width: 500px;
  margin: 20px auto;
  padding: 20px;
  background:#f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.timetable-form h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  min-width: 120px;
  max-width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 🔹 관련 필드 가로 정렬 */
.inline-group {
  display: flex;
  gap: 10px;
}

.inline-group .form-group {
  flex: 1;
}

/* 🔹 버튼 정렬 */
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

