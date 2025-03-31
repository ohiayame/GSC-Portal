<script setup>
import { computed, ref, onMounted } from "vue";
import { useTimetableStore } from "../stores/timetable";
import { useSpecialSessionStore } from "../stores/specialSessions";
import { useRouter } from "vue-router";
import { useAuthStore } from '@/stores/auth';
import Modal from '@/components/TimetableModal.vue';
import { useAssignLevelStore } from '@/stores/assignLevel';
const assignStore = useAssignLevelStore();

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

  if (user.value.role === '학생') {
    await assignStore.fetchAssignedCourses(user.value.id);
  }
});

const professorList = computed(() => {
  const allProfessors = store.timetables.map(cls => cls.professor);
  return [...new Set(allProfessors)];
});

// ✅ 특정 학년 & 날짜 기준으로 시간표 필터링
const filteredTimetables = computed(() => {
  const selectedGrade = Number(store.searchTarget);
  const weekDates = getWeekDates(selectedDate.value);
  const weekStart = new Date(weekDates[0]);
  const weekEnd = new Date(weekDates[weekDates.length - 1]);

  // ✅ 전체 시간표에서 해당 학년의 정규수업 필터링
  const timetable = store.timetables.filter(cls => {
    const isCorrectGrade = Number(cls.grade) === selectedGrade;
    const classStart = new Date(cls.start_date);
    const classEnd = new Date(cls.end_date);
    const isWithinWeekRange = classStart <= weekEnd && classEnd >= weekStart;

    const isProfessorMatch = !selectedProfessor.value || cls.professor === selectedProfessor.value;

    return isCorrectGrade && isWithinWeekRange && isProfessorMatch;
  });

  // ✅ 학생일 경우 assignedCourses 추가
  if (user.value.role === "학생") {
    const assignedIds = assignStore.assignedCourses.map(a => a.course_id);

    const assignedCourses = store.timetables.filter(cls =>
      assignedIds.includes(cls.course_id) &&
      new Date(cls.start_date) <= weekEnd &&
      new Date(cls.end_date) >= weekStart
    );
    const specialCourses = timetable.filter(cls => cls.class_section === null);

    // 🔁 학년별 정규수업 + 특강 합쳐서 반환
    return [...specialCourses, ...assignedCourses];
  }

  return timetable;
});




const filteredSessions = computed(() => {
  const weekDates = getWeekDates(selectedDate.value);
  const selectedGrade = Number(store.searchTarget);
  const selectedProf = selectedProfessor.value;

  return specialStore.sessions.filter(session => {
    const isInThisWeek = weekDates.includes(session.date);
    const relatedClass = store.timetables.find(cls => cls.course_id === session.course_id);

    if (!isInThisWeek) return false;

    // 교수 필터 조건
    if (selectedProf) {
      return relatedClass && relatedClass.professor === selectedProf;
    }

    // 보강/휴강 세션의 학년 조건 체크
    if (session.grade !== undefined) {
      return session.grade === selectedGrade;
    }

    // relatedClass가 없더라도, session이 이 주차에 존재하면 보여줘야 함
    return !relatedClass || relatedClass.grade === selectedGrade;
  });
});


const getWeekDates = (selectedDate) => {
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay(); // 0: 일요일 ~ 6: 토요일

  // ✅ 일요일이면 다음 주 월요일로 계산
  const mondayOffset = dayOfWeek === 0 ? 1 : 1 - dayOfWeek;

  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 5 }, (_, index) => {
    const newDate = new Date(monday);
    newDate.setDate(monday.getDate() + index);
    return newDate.toISOString().split("T")[0]; // YYYY-MM-DD
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

const getSpecialSessionsAt = (day, period, type, courseId = null) => {
  return filteredSessions.value.filter(session => {
    const sessionWeekDates = getWeekDates(selectedDate.value);
    const dateIndex = sessionWeekDates.findIndex(d => d === session.date);
    if (dateIndex === -1) return false;

    const sessionDay = days[dateIndex];

    const isMatchingTime = (
      sessionDay === day &&
      session.start_period <= period &&
      period < session.start_period + session.duration
    );

    const isTypeMatch = session.type === type;
    const isCourseMatch = courseId ? session.course_id === courseId : true;

    return isMatchingTime && isTypeMatch && isCourseMatch;
  });
};

// 보강용
const getMakeupSession = (day, period) => {
  const result = getSpecialSessionsAt(day, period, "보강");
  return result.length > 0 ? result[0] : null; // 기존 .find()와 동일하게 하나만 반환
};

// 휴강용
const isClassCancelled = (cls, day, period) => {
  const result = getSpecialSessionsAt(day, period, "휴강", cls.course_id);
  return result.length > 0;
};



const showModal = ref(false);
const selectedClasses = ref([]);
const selectedDay = ref('');
const selectedPeriod = ref(0);

const openModal = (day, period) => {
  selectedDay.value = day;
  selectedPeriod.value = period;
  selectedClasses.value = getClassAt(day, period);
  showModal.value = true;
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
        <option value="0" v-if="user?.role !== '학생'">특강</option>
        <option value="1">1학년</option>
        <option value="2">2학년</option>
        <option value="3">3학년</option>
      </select>
      <br><br>
      <label for="date">날짜 선택: </label>
      <input type="date" id="date" v-model="selectedDate" />
      <br><br>
      <div v-if="user?.role !== '학생'" >
      <label for="professor">교수 선택 : </label>
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
            class="clickable-cell"
          >
            <!-- 여러개 수업 있는경우 -->
            <div
              v-if="getClassAt(day, period).length > 2"
              class="multi-class-cell"
              @click.stop="openModal(day, period)"
            >
              📚 {{ getClassAt(day, period).length }}개 수업
            </div>
            <!-- 휴강, 정규 출력 -->
            <div
              v-else
              v-for="cls in getClassAt(day, period)"
              :key="cls.course_id + '-' + cls.class_section"
            >
              <!-- 휴강 출력 -->
              <div v-if="isClassCancelled(cls, day, period)" class="specialH-session">
                ❌ 휴강
              </div>
              <!-- 출력 (클릭 시 휴강 등록) -->
              <div v-else
              @click.stop="goToSpecialSession([cls])"
              :class="['class-info', { 'special-class': cls.type === 'special' }]"
              >
                <strong>{{ cls.course_name }}</strong><br />
                <span>{{ cls.location }}</span><br />
                <span>{{ cls.professor }}</span><br />
                <span v-if="cls.class_section">({{ cls.class_section }}반)</span>
              </div>
            </div>

            <!-- 보강 출력 -->
            <template v-if="(makeup = getMakeupSession(day, period))">
              <div class="special-session">
                <strong>* 보강 * </strong><br>
                {{ makeup.course_name }}<br />
                <span>{{ makeup.location }}</span><br />
                <span>{{ makeup.professor }}</span><br />
              </div>
            </template>
            </td>
        </tr>
      </tbody>
    </table>
  </div>
            <!-- 🧩 모달 컴포넌트는 반복문 밖에 있어야 함 -->
            <Modal v-if="showModal" @close="showModal = false">
  <template #header>
    <h3>{{ selectedDay }} {{ selectedPeriod }}교시 수업 목록</h3>
  </template>

  <div class="modal-class-list">
    <div
      class="modal-class-card"
      v-for="cls in selectedClasses"
      :key="cls.course_id + '-' + cls.class_section"
      :class="cls.type === 'special' ? 'special' : 'regular'"
    >
      <div class="title">{{ cls.course_name }}</div>
      <div class="sub">{{ cls.professor }} | {{ cls.location }}</div>
    </div>
  </div>
</Modal>

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
  background-color: #f0f8ff; /* 연한 베이지-오렌지 배경 */
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: #333;

  /* 예쁜 곡선 포인트 테두리 추가 */
  border-left: 6px solid #4dacff; /* 오렌지 색 테두리 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}


.class-info:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);  /* ✅ 살짝 강조되게 */
}
.special-class {
  background-color: #fff4e6;  /* 부드러운 주황 계열 */
  border-left: 5px solid #ffa94d;  /* 강조 효과 */
  font-weight: 600;
}





.special-session {
  background-color: #fff0f0; /* 연한 하늘색 배경 */
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;

  border-left: 6px solid #eb481f; /* 파란 포인트 테두리 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}


.clickable-cell {
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.clickable-cell:hover {
  background-color: var(--color-hover);
}
.multi-class-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  background-color: #f8fbff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.325);

  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.multi-class-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}


.modal-class-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.modal-class-card {
  padding: 12px 16px;
  border-radius: 12px;
  color: #333;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out;
}

.modal-class-card .label {
  font-size: 11px;
  font-weight: bold;
  color: #999;
  margin-bottom: 4px;
}

.modal-class-card .title {
  font-size: 15px;
  font-weight: bold;
}

.modal-class-card .sub {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.modal-class-card.regular {
  background-color: #f0f8ff;
}

.modal-class-card.special {
  background-color: #fff4e6;
}

</style>

