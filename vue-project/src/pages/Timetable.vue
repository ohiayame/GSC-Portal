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
const selectedProfessor = ref("");

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

const professorList = computed(() => {
  const allProfessors = store.timetables.map(cls => cls.professor);
  return [...new Set(allProfessors)];
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
    const isProfessorMatch = !selectedProfessor.value || cls.professor === selectedProfessor.value;
    if (selectedProfessor.value !== ""){
      console.log("교수 :", selectedProfessor.value);
      return isWithinDateRange && isProfessorMatch;
    }
    return isCorrectGrade && isWithinDateRange ;
  });
});

const filteredSessions = computed(() => {
  const weekDates = getWeekDates(selectedDate.value); // ✅ 이번 주의 모든 날짜 가져오기
  const selectedGrade = Number(store.searchTarget); // ✅ 선택된 학년
  const selectedProf = selectedProfessor.value;
  return specialStore.sessions.filter(session => {
    const isInThisWeek = weekDates.includes(session.date);
    if (selectedProf) {
      const relatedClass = store.timetables.find(cls => cls.course_id === session.course_id);
      return relatedClass && relatedClass.professor === selectedProf && isInThisWeek;
    }
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
  return filteredTimetables.value.filter(
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
const isClassCancelled = (cls, day, period) => {
  const session = filteredSessions.value.find(session => {
    const sessionWeekDates = getWeekDates(selectedDate.value);
    const sessionDay = days[sessionWeekDates.findIndex(d => d === session.date)];
    return (
      sessionDay === day &&
      session.start_period <= period &&
      period < session.start_period + session.duration &&
      session.course_id === cls.course_id &&
      session.type === "휴강"
    );
  });
  return !!session;
};




// ✅ 시간표 셀 클릭 시 보강/휴강 등록 페이지 이동
const goToSpecialSession = (courseList) => {
  const course = courseList[0];
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
    <h1>시간표</h1>

    <div class="filter-container">
      <label for="grade">학년 선택 : </label>
      <select id="grade" v-model="store.searchTarget">
        <option value="1">1학년</option>
        <option value="2">2학년</option>
        <option value="3">3학년</option>
      </select>
      <br><br>
      <label for="date">날짜 선택: </label>
      <input type="date" id="date" v-model="selectedDate" />
      <br><br>
      <div v-if="user?.role !== '학생'" >
      <labe for="professor">교수 선택 : </labe>
        <select id="professor" v-model="selectedProfessor">
          <option value="">전체</option>
          <option v-for="prof in professorList" :key="prof" :value="prof">
            {{ prof }}
          </option>
        </select>
      </div>
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


            <!-- ✅ 기존 수업 정보 (휴강이 아닐 때만 표시) -->

              <div
              v-for="cls in getClassAt(day, period)"
              :key="cls.course_id + '-' + cls.class_section"
            >
            <div v-if="isClassCancelled(cls, day, period)" class="specialH-session">
              ❌ 휴강
            </div>
            <div v-else class="class-info">
              <strong>{{ cls.course_name }}</strong><br />
              <span>{{ cls.location }}</span><br />
              <span>{{ cls.professor }}</span><br />
              <span v-if="cls.class_section">({{ cls.class_section }}반)</span>
            </div>
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
:root {
  --font: 'Pretendard', 'Noto Sans KR', sans-serif;
  --color-main: #007bff;
  --color-bg: #f9fafe;
  --color-border: #e0e6ed;
  --color-time: #f1f3f5;
  --color-hover: rgba(0, 123, 255, 0.08);
  --color-class-default: #e3f2fd;
  --color-special: #fff6da;
  --color-holiday: #ffe6e6;
  --color-button-text: #fff;
}

body {
  background-color: var(--color-bg);
  font-family: var(--font);
}

h1 {
  text-align: center;
  color: rgb(60, 161, 255);
  font-size: 28px;
  font-weight: 800;
}

.timetable-container {
  width: 95%;
  max-width: 1000px;
  margin: 10px auto;
  padding: 24px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  font-family: var(--font);
}

.filter-container {
  display: inline-block;
  margin: 0 8px 0px 50px;
  font-weight: 500;
  color: #444;
}

select,
input[type="date"] {
  width: 100px;
  padding: 1px 10px;
  font-size: 14px;
  border: 1.5px solid var(--color-main);
  transition: border-color 0.2s ease;
  font-family: inherit;
  border: 2px solid #5fa2d200;
  border-radius: 6px;
  background-color: #f6faff;
}
select:focus,
input:focus {
  border-color: #4d8eff;
  outline: none;
}

.button-container {
  display: flex;
  justify-content: end;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 15px 20px;
}

button {
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  background-color: var(--color-main);
  color: var(--color-button-text);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(122, 186, 255, 0.468);
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.417);
}

table {
  width: 80%;
  background: rgba(236, 236, 236, 0.381);
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
  margin: 0 auto;
}

th,
td {
  border: 1px solid var(--color-border);
  padding: 12px;
  text-align: center;
  vertical-align: middle;
}

th {
  background: #eef4fb;
  font-weight: 600;
  color: #333;
}

td {
  height: 60px;
  min-width: 120px;
  background-color: white;
}

.time-label {
  background: var(--color-time);
  font-weight: bold;
  color: #555;
}

.class-info {
  background-color: #f9fbff;  /* ✅ 거의 흰색에 가까운 밝은 배경 */
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: #333;  /* ✅ 너무 어둡지도 연하지도 않은 텍스트 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.class-info:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);  /* ✅ 살짝 강조되게 */
}


.special-session {
  background-color: var(--color-special);
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: #856404;
  box-shadow: inset 0 0 0 1px #ffe58f;
}

.specialH-session {
  background-color: var(--color-holiday);
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #c92a2a;
  box-shadow: inset 0 0 0 1px #ffa8a8;
}

.clickable-cell {
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.clickable-cell:hover {
  background-color: var(--color-hover);
}
</style>

