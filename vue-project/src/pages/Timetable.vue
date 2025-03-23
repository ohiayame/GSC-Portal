<script setup>
import { computed, ref, onMounted } from "vue";
import { useTimetableStore } from "../stores/timetable";
import { useSpecialSessionStore } from "../stores/specialSessions";
import { useRouter } from "vue-router";
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
const user = computed(() => auth.user);

const store = useTimetableStore();
const specialStore = useSpecialSessionStore();
const router = useRouter();
const selectedDate = ref(new Date().toISOString().split("T")[0]); // ✅ 기본값: 오늘 날짜

// ✅ 요일과 시간 범위 설정
const days = ["월", "화", "수", "목", "금"];  // ,"토"
const periods = Array.from({ length: 10 }, (_, i) => i + 1); // 1교시 ~ 10교시

// ✅ 페이지 로드시 시간표 데이터 불러오기
onMounted(async () => {
  store.initSearchTarget();
  await store.fetchTimetables();
  await specialStore.fetchSessions();
  console.log("📌 초기 시간표 데이터:", store.timetables);
  console.log("📌 휴보강 시간표 데이터:", specialStore.sessions);
});

// ✅ 특정 학년 & 날짜 기준으로 시간표 필터링
const filteredTimetables = computed(() => {
  console.log(`🎯 선택된 학년: ${store.searchTarget}`);
  console.log(`🎯 선택된 날짜: ${selectedDate.value}`);

  const selectedGrade = Number(store.searchTarget);
  return store.timetables.filter(cls => {
    const isCorrectGrade = Number(cls.grade) === selectedGrade;
    const isWithinDateRange = new Date(cls.start_date) <= new Date(selectedDate.value) &&
                              new Date(selectedDate.value) <= new Date(cls.end_date);
    return isCorrectGrade && isWithinDateRange;
  });
});

const filteredSessions = computed(() => {
  const weekDates = getWeekDates(selectedDate.value); // ✅ 이번 주의 모든 날짜 가져오기
  const selectedGrade = Number(store.searchTarget); // ✅ 선택된 학년

  return specialStore.sessions.filter(session => {
    // ✅ session.grade와 선택된 학년 비교 (grade 필드가 있는 경우)
    if (session.grade !== undefined) {
      return session.grade === selectedGrade && weekDates.includes(session.date);
    }

    // ✅ grade 필드가 없는 경우, timetable에서 course_id를 기반으로 학년 확인
    const relatedClass = store.timetables.find(cls => cls.course_id === session.course_id);
    return relatedClass && relatedClass.grade === selectedGrade && weekDates.includes(session.date);
  });
});



const getWeekDates = (selectedDate) => {
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay(); // 0: 일요일 ~ 6: 토요일
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일로 이동
  const monday  = new Date(date);
  monday .setDate(date.getDate() + mondayOffset);

  // return days.map((_, index) => {
    return Array.from({ length: 5 }, (_, index) => {
    const newDate = new Date(monday);
    newDate.setDate(monday.getDate() + index); // 월요일 + index 일 후
    return newDate.toISOString().split("T")[0]; // YYYY-MM-DD 형식 반환
  });
};
const daysWithDates = computed(() => {
  const weekDates = getWeekDates(selectedDate.value);
  return days.map((day, index) => `${day} (${weekDates[index].slice(5)})`);
});

// ✅ 특정 시간과 요일에 해당하는 수업 찾기 (연강 포함)
const getClassAt = (day, period) => {
  return filteredTimetables.value.find(
    (cls) => cls.day === day && cls.period <= period && period < cls.period + cls.duration
  );
};

const getSpecialSessionAt = (day, period) => {
  return filteredSessions.value.find(session => {
    const sessionWeekDates = getWeekDates(selectedDate.value);
    const sessionDay = days[sessionWeekDates.findIndex(d => d === session.date)];

    return sessionDay === day && session.start_period <= period && period < session.start_period + session.duration;
  });
};



// ✅ 시간표 셀 클릭 시 보강/휴강 등록 페이지 이동
const goToSpecialSession = (course) => {
  if (!course || user.value.role === '학생') return;


  console.log("🚀 클릭된 수업 정보:", course);
  console.log("📌 course_id 값 확인:", course.course_id);

  const weekDates = getWeekDates(selectedDate.value); // ✅ 주간 날짜 계산
  const dayIndex = days.indexOf(course.day); // ✅ course.day의 요일 인덱스 찾기
  const dateForSelectedDay = weekDates[dayIndex];

  console.log("📌 day 값 확인:", dateForSelectedDay);

  router.push({
    path: "/timetable/special",
    query: {
      course_id: course.course_id,
      date: dateForSelectedDay ,
      start_period: course.period,
      duration: course.duration,
      course_name: course.course_name,
      type: "휴강",
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

    <!-- ✅ 날짜 필터 추가 -->
    <div class="filter-container">
      <label for="date">날짜 선택:</label>
      <input type="date" id="date" v-model="selectedDate" />
    </div>

    <!-- ✅ 버튼 추가 -->
    <div v-if="user?.role !== '학생'" class="button-container">
      <button @click="$router.push('/timetable/manage')">시간표 편집</button>
      <button @click="$router.push('/timetable/new')">새 시간표 등록</button>
      <button @click="$router.push({ path: '/timetable/special', query: { type: '보강' } })">
        보강 등록
      </button>
    </div>

    <table class="timetable">
      <thead>
        <tr>
          <th></th>
          <th v-for="(day, index) in daysWithDates" :key="index">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="period in periods" :key="period">
          <td class="time-label">
            {{ period }}교시
            <br /><span>{{ period + 8 }}시~</span>
          </td>
          <td
            v-for="day in days"
            :key="day"
            @click="getClassAt(day, period) || getSpecialSessionAt(day, period) ? goToSpecialSession(getClassAt(day, period) || getSpecialSessionAt(day, period)) : null"
            class="clickable-cell"
          >
            <!-- ✅ 휴강이면 기존 수업 숨기고 '❌ 휴강' 표시 -->
            <div v-if="getSpecialSessionAt(day, period) && getSpecialSessionAt(day, period).type === '휴강'" class="specialH-session">
              ❌ 휴강
            </div>

            <!-- ✅ 기존 수업 정보 (휴강이 아닐 때만 표시) -->
            <div v-else-if="getClassAt(day, period)" class="class-info">
              <strong>{{ getClassAt(day, period).course_name }}</strong><br />
              <span>{{ getClassAt(day, period).location }}</span><br />
              <span>{{ getClassAt(day, period).professor }}</span><br />
            </div>

            <!-- ✅ 보강이 있는 경우 기존 수업이 없어도 표시 -->
            <div v-if="getSpecialSessionAt(day, period) && getSpecialSessionAt(day, period).type === '보강'" class="special-session">
              🔄 보강 <br> <strong>{{ getSpecialSessionAt(day, period).course_name || "수업 정보 없음" }}</strong><br />
              <span v-if="getSpecialSessionAt(day, period).location">{{ getSpecialSessionAt(day, period).location }}</span><br />
              <span v-if="getSpecialSessionAt(day, period).professor">{{ getSpecialSessionAt(day, period).professor }}</span><br />
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

.filter-container {
  margin-bottom: 15px;
}

.filter-container label {
  font-weight: bold;
  margin-right: 10px;
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

th,
td {
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

.special-session {
  background: #fdfce3;
  padding: 5px;
  border-radius: 5px;
  font-size: 14px;
}
.specialH-session{
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
