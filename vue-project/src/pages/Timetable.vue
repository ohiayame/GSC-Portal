<script setup>
import { computed, onMounted, watch } from "vue";
import { useTimetableStore } from "../stores/timetable";
import { useRouter } from "vue-router";

const store = useTimetableStore();
const router = useRouter();

// ✅ 요일과 시간 범위 설정
const days = ["월", "화", "수", "목", "금"];
const periods = Array.from({ length: 10 }, (_, i) => i + 1); // 1교시 ~ 10교시

// ✅ 페이지 로드시 시간표 데이터 불러오기
onMounted(async () => {
  await store.fetchTimetables();
  console.log("📌 초기 시간표 데이터:", store.timetables);
});

// ✅ 특정 학년의 시간표만 필터링 (동적)
const filteredTimetables = computed(() => {
  console.log(`🎯 선택된 학년: ${store.searchTarget}`);
  console.log(`🎯 timetables : ${store.timetables}`);
  const selectedGrade = Number(store.searchTarget);
  const result = store.timetables.filter(cls => Number(cls.grade) === selectedGrade);

  console.log(`🎯 선택된 학년: ${store.searchTarget}, 필터링된 시간표:`, result);
  return result;
});

// ✅ 학년 변경 감지
watch(() => store.searchTarget, (newGrade) => {
  console.log(`🎯 학년 변경 감지: ${newGrade}`);
});

// ✅ 특정 시간과 요일에 해당하는 수업 찾기 (연강 포함)
const getClassAt = (day, period) => {
  return filteredTimetables.value.find(
    (cls) => cls.day === day && cls.period <= period && period < cls.period + cls.duration
  );
};

// ✅ 시간표 셀 클릭 시 보강/휴강 등록 페이지 이동
const goToSpecialSession = (course) => {
  if (!course) return;

  console.log("🚀 클릭된 수업 정보:", course);
  console.log("📌 course_id 값 확인:", course.course_id);

  router.push({
    path: "/timetable/special",
    query: {
      course_id: course.course_id,
      day: course.day,
      start_period: course.period,
      name: course.course_name,
      type: '휴강'
    },
  });
};
</script>

<template>
  <div class="timetable-container">
    <h2>시간표</h2>

    <div class="filter-container">
      <label for="grade">학년 선택:</label>
      <select id="grade" v-model="store.searchTarget">
        <option value="1">1학년</option>
        <option value="2">2학년</option>
        <option value="3">3학년</option>
      </select>
    </div>

    <!-- ✅ 버튼 추가 -->
    <div class="button-container">
      <button @click="$router.push('/timetable/new')">새 시간표 등록</button>
      <button @click="$router.push({path:'/timetable/special', query:{type: '보강'}})">보강 등록</button>
    </div>

    <table class="timetable">
      <thead>
        <tr>
          <th></th>
          <th v-for="day in days" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="period in periods" :key="period">
          <td class="time-label">{{ period }}교시</td>
          <td
            v-for="day in days"
            :key="day"
            @click="getClassAt(day, period) ? goToSpecialSession(getClassAt(day, period)) : null"
            class="clickable-cell"
          >
            <div v-if="getClassAt(day, period)" class="class-info">
              <strong>{{ getClassAt(day, period).course_name }}</strong><br />
              <span>{{ getClassAt(day, period).location }}</span><br />
              <span>{{ getClassAt(day, period).professor }}</span><br />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.timetable-container {
  width: 90%;
  max-width: 800px;
  margin: 20px auto;
  text-align: center;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 15px;
}

button {
  padding: 8px 12px;
  font-size: 14px;
  background-color: #485ff7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #5fb7ff;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

th {
  background: #a7c7e7;
  font-weight: bold;
}

td {
  height: 50px;
  min-width: 120px;
}

.time-label {
  background: #f3f3f3;
  font-weight: bold;
}

.class-info {
  background: #e3f2fd;
  padding: 5px;
  border-radius: 5px;
  font-size: 14px;
}

/* ✅ 클릭 가능한 셀 스타일 추가 */
.clickable-cell {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-cell:hover {
  background-color: rgba(72, 95, 247, 0.2);
}
</style>
