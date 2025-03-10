<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTimetableStore } from "../stores/timetable";

const store = useTimetableStore();
const route = useRoute();
const router = useRouter();

const isEditMode = ref(false); // ✅ 수정 모드인지 여부 확인

const form = ref({
  course_id: "",
  course_name: "",
  professor: "정영철",
  grade: 1,
  class_section: null,
  type: "regular",
  day: "",
  period: "2",
  duration: "",
  location: "창조관-",
  start_date: null,
  end_date: null,
});

// ✅ 페이지 로드시 기존 데이터가 있으면 자동 입력 (수정 모드)
onMounted(() => {
  if (route.query.course_id) {
    isEditMode.value = true;
    form.value = { ...route.query };
    console.log("🚀 등록 데이터:", form.value);
  }
});

// const checkDuplicateTimetable = () => {
//   // 🔹 현재 선택한 값 가져오기
//   const selectedGrade = form.value.grade;
//   const selectedDay = form.value.day;
//   const selectedPeriod = form.value.period;
//   const selectedDuration = form.value.duration;
//   const selectedSection = form.value.class_section;

//   // 🔹 같은 학년, 같은 요일, 같은 시간에 중복된 수업이 있는지 확인
//   const hasDuplicate = store.timetables.some((tt) => {
//     return (
//       tt.grade === selectedGrade &&
//       tt.day === selectedDay &&
//       tt.period <= selectedPeriod &&
//       selectedPeriod < tt.period + tt.duration
//     );
//   });

//   // 🔹 중복된 경우, 기존 수업 또는 새 수업 중 하나라도 분반이 없는지 확인
//   if (hasDuplicate) {
//     const overlappingClass = store.timetables.find((tt) =>
//       tt.grade === selectedGrade && tt.day === selectedDay &&
//       tt.period <= selectedPeriod && selectedPeriod < tt.period + tt.duration
//     );

//     if (overlappingClass.class_section === 1 || selectedSection === 1) {
//       alert(`⚠️ 중복된 시간표가 존재하며, 분반이 없는 경우 등록할 수 없습니다.
//       기존 수업: ${overlappingClass.course_name} (${overlappingClass.class_section}분반)`);
//       return false;
//     }
//   }

//   return true;
// };


const saveTimetable = async () => {
  if (!form.value.course_name || !form.value.day || !form.value.period || !form.value.duration) {
    alert("📌 모든 필수 항목을 입력하세요!");
    return;
  }
  // if (!checkDuplicateTimetable()) {
  //   return;
  // }
  try{
    if (isEditMode.value) {
      // ✅ 수정 요청 시 과목 정보도 함께 보냄
      console.log("🚀 등록 요청 데이터:", form.value);
      await store.updateTimetable(form.value);
      alert("✅ 시간표 및 과목 수정 완료!");

    } else {
      // ✅ 새 과목 추가
      const courseData = {
        course_name: form.value.course_name,
        professor: form.value.professor,
        grade: form.value.grade,
        class_section: form.value.class_section || null,
        type: form.value.type,
      };

      const courseResponse = await store.addCourse(courseData);
      if (!courseResponse || !courseResponse.course_id) {
        alert("❌ 과목 추가 실패!");
        return;
      }

      const timetableData = {
        course_id: courseResponse.course_id,
        day: form.value.day,
        period: form.value.period,
        duration: form.value.duration,
        location: form.value.location,
        start_date: form.value.start_date,
        end_date: form.value.end_date,
      };

      await store.addTimetable(timetableData);
      alert("✅ 새 시간표 등록 완료!");
    }
    router.push("/timetable");

  } catch (err) {
    console.error("🚨 등록 오류:", err);
    alert("❌ 시간표 추가 중 오류가 발생했습니다.");
  }
};


</script>

<template>
  <div class="timetable-form">
    <h2>{{ isEditMode ? "시간표 수정" : "시간표 등록" }}</h2>

    <!-- 새로운 과목 입력 -->
    <div class="form-group">
      <label for="course_name">과목명</label>
      <input id="course_name" type="text" v-model="form.course_name" placeholder="과목 입력" />
    </div>

    <div class="form-group">
      <label for="professor">교수</label>
      <input id="professor" type="text" v-model="form.professor" placeholder="정영철" />
    </div>

    <div class="inline-group">
      <div class="form-group">
        <label for="grade">학년</label>
        <select id="grade" v-model="form.grade">
          <option :value="1">1학년</option>
          <option :value="2">2학년</option>
          <option :value="3">3학년</option>
        </select>
      </div>

      <div class="form-group">
        <label for="class_section">분반</label>
        <input id="class_section" type="number" v-model="form.class_section" min="1" />
      </div>
    </div>

    <div class="form-group">
      <label for="day">요일</label>
      <select id="day" v-model="form.day">
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
        <input id="period" type="number" v-model="form.period" min="1" />
      </div>

      <div class="form-group">
        <label for="duration">수업 시간</label>
        <input id="duration" type="number" v-model="form.duration" min="1" />
      </div>
    </div>

    <div class="form-group">
      <label for="location">강의실</label>
      <input id="location" type="text" v-model="form.location" placeholder="강의실 입력" />
    </div>

    <div class="inline-group">
      <div class="form-group">
        <label for="start_date">개강일</label>
        <input id="start_date" type="date" v-model="form.start_date" />
      </div>

      <div class="form-group">
        <label for="end_date">종강일</label>
        <input id="end_date" type="date" v-model="form.end_date" />
      </div>
    </div>

    <div class="button-container">
      <button @click="router.push(isEditMode ? '/timetable/manage' : '/timetable')" class="back">
        돌아가기
      </button>
      <button @click="saveTimetable" class="register">{{ isEditMode ? "수정" : "등록" }}</button>
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
