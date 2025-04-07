<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from '@/stores/auth';
import { useTimetableStore } from "../stores/timetable";
import { useSpecialSessionStore } from "../stores/specialSessions";
import { useAssignLevelStore } from '@/stores/assignLevel';
import Modal from '@/components/TimetableModal.vue';

const router = useRouter();
// 학생 정보
const auth = useAuthStore();
const user = computed(() => auth.user);
// 시간표 정보
const store = useTimetableStore();
const specialStore = useSpecialSessionStore();
const assignStore = useAssignLevelStore();

const selectedDate = ref(new Date().toISOString().split("T")[0]); // ✅ 기본값: 오늘 날짜
const selectedProfessor = ref("");

// 요일과 시간 범위 설정
const days = ["월", "화", "수", "목", "금"];  // ,"토"
const periods = Array.from({ length: 10 }, (_, i) => i + 1); // 1교시 ~ 10교시

// 페이지 로드시 시간표 데이터 불러오기
onMounted(async () => {
  store.initSearchTarget(); // 학년 셋팅
  await store.fetchTimetables(); // 시간표 목록 불러오기
  await specialStore.fetchSessions(); // 휴보강 목록 불러오기
  console.log("📌 초기 시간표 데이터:", store.timetables);
  console.log("📌 휴보강 시간표 데이터:", specialStore.sessions);
  console.log("📌 공휴일 데이터:", selectedDate.value.getFullYear());
  if (user.value.role === '학생') {
    // 학생 해당 반만 가져오기
    await assignStore.fetchAssignedCourses(user.value.id);
  }
});

// 교수님 이름 배열
const professorList = computed(() => {
  const allProfessors = store.timetables.map(cls => cls.professor);
  return [...new Set(allProfessors)];
});

// 특정 학년 & 날짜 기준으로 시간표 필터링
const filteredTimetables = computed(() => {
  const selectedGrade = Number(store.searchTarget); // 학년 셋팅
  const weekDates = getWeekDates(selectedDate.value); // 해당 주의 날짜 배열
  const weekStart = new Date(weekDates[0]);
  const weekEnd = new Date(weekDates[weekDates.length - 1]);

  // 전체 시간표에서 해당 학년의 정규수업 필터링
  const timetable = store.timetables.filter(cls => {
    const isCorrectGrade = Number(cls.grade) === selectedGrade || Number(cls.grade) === 0 || Number(cls.grade) === 4;  // 동일 학년의 과목
    // 과목의 기간
    const classStart = new Date(cls.start_date);
    const classEnd = new Date(cls.end_date);
    const isWithinWeekRange = classStart <= weekEnd && classEnd >= weekStart;
    // 교수 필터링(선택이 있으면 적용)
    const isProfessorMatch = !selectedProfessor.value || cls.professor === selectedProfessor.value;
    // 학년, 기간, (교수 이름)으로 필터링 결과 반환 -> timetable에 저장
    if (selectedProfessor.value){
      return isWithinWeekRange && isProfessorMatch;
    }
    return isCorrectGrade && isWithinWeekRange;
  });

  // 학생일 경우 해당 반의 정보만 나오게 필터링
  if (user.value.role === "학생" && user.value.grade === selectedGrade) {
    // 학생의 id로 해당 과목 id 불러오기 (배열)
    const assignedIds = assignStore.assignedCourses.map(a => a.course_id);

    // 해당 과목의 내용을 뽑아내기
    const assignedCourses = store.timetables.filter(cls =>
      assignedIds.includes(cls.course_id) &&
      new Date(cls.start_date) <= weekEnd &&
      new Date(cls.end_date) >= weekStart
    );
    // 분반 설정이 있는 과목 삭제 (assignedCourses에서 불러기 때문에 증복 방지)
    const specialCourses = timetable.filter(cls => cls.class_section === null && cls.grade !== 0 && cls.grade !== 4);

    // 학년별 정규수업 + 특강 합쳐서 반환
    return [...specialCourses, ...assignedCourses];
  }
  return timetable;

});

const filteredSessions = computed(() => {
  const weekDates = getWeekDates(selectedDate.value);
  const selectedGrade = Number(store.searchTarget);
  const selectedProf = selectedProfessor.value;

  const assignedIds = assignStore.assignedCourses.map(a => a.course_id);

  const sessions = specialStore.sessions.filter(session => {
    const isInThisWeek = weekDates.includes(session.date);
    if (!isInThisWeek) return false;

    const relatedClass = store.timetables.find(cls => cls.course_id === session.course_id);

    // 교수 필터 (관리자, 교수만 해당)
    if (selectedProf) {
      return relatedClass && relatedClass.professor === selectedProf;
    }

    // 학생이 자기 학년을 선택했을 경우 → 자기 반에 배정된 수업만 표시
    if (user.value.role === "학생" && user.value.grade === selectedGrade) {
      return assignedIds.includes(session.course_id) || relatedClass.grade === selectedGrade;
    }

    // 학년 일치 or 특강 표시
    return relatedClass.grade === selectedGrade || relatedClass.grade === 0 || relatedClass.grade === 4 ;
  });
  return sessions;
});

const fetchHolidaysForWeek = async () => {
  const weekDates = getWeekDates(selectedDate.value); // ['2025-04-28', ..., '2025-05-02']
  const uniqueYearMonth = new Set(
    weekDates.map(dateStr => {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${d.getMonth() + 1}`;
    })
  );

  store.holidays = []; // 초기화 (중복 방지)

  for (const ym of uniqueYearMonth) {
    const [year, month] = ym.split('-').map(Number);
    await store.fetchHolidays(year, month); // Pinia 내부에서 holidays에 합쳐서 저장하는 방식이면 OK
  }

  console.log("📅 주간 공휴일 데이터:", store.holidays);
};


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

// 날짜가 공휴일인지 여부 확인 함수
const isHoliday = (date) => {
  const formatted = date.replaceAll('-', ''); // '2025-05-05' → '20250505'
  return store.holidays.some(h => String(h.locdate) === formatted);
};

const daysWithDates = computed(() => {
  const weekDates = getWeekDates(selectedDate.value);
  return days.map((day, index) => `${day} (${weekDates[index].slice(5)})`);
});

// 🔹 공휴일 이름 반환 (ex: '어린이날') → 없으면 null
const getHolidayName = (date) => {
  const formatted = date.replaceAll('-', '');
  const holiday = store.holidays.find(h => String(h.locdate) === formatted);
  return holiday ? holiday.dateName : null;
};

// ✅ 특정 시간과 요일에 해당하는 수업 찾기 (연강 포함)
const getClassAt = (day, period) => {
  return filteredTimetables.value.filter(
    (cls) => cls.day === day && cls.period <= period && period < cls.period + cls.duration
  );
};

const getSpecialSessionsAt = (day, period, type, courseId = null) => {
  // console.log("filteredSessions", filteredSessions)
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
    <h1>Timetable</h1>

    <!-- 템플릿 구조 개선 -->
    <div class="filter-container">
      <div class="filters-left">
        <div class="filter-item">
          <label for="grade">학년 선택:</label>
          <select id="grade" v-model="store.searchTarget">
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="date">날짜 선택:</label>
          <input type="date" id="date" v-model="selectedDate" @change="fetchHolidaysForWeek" />
        </div>
        <div v-if="user?.role !== '학생'" class="filter-item">
          <label for="professor">교수 선택:</label>
          <select id="professor" v-model="selectedProfessor">
            <option value="">전체</option>
            <option v-for="prof in professorList" :key="prof" :value="prof">
              {{ prof }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="user?.role !== '학생'" class="filters-right">
        <button @click="$router.push('/timetable/manage')">시간표 편집</button>
        <button @click="$router.push('/timetable/new')">새 시간표 등록</button>
        <button @click="$router.push({ path: '/timetable/special', query: { type: '보강' } })">
          보강 등록
        </button>
      </div>
    </div>




    <table class="timetable">
      <thead>
        <tr>
          <th></th>
          <th v-for="(day, index) in daysWithDates"
          :key="index"
          >
            {{ day }}
            <div v-if="getHolidayName(getWeekDates(selectedDate)[index])" class="holiday-label">
              {{ getHolidayName(getWeekDates(selectedDate)[index]) }}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="period in periods" :key="period">
          <td class="time-label">
            <span>{{ period }}교시</span>
            <br />{{ period + 8 }}시~
          </td>
          <td
            v-for="(day, dayIndex) in days"
            :key="day"
            :class="['clickable-cell', { 'holiday-column': isHoliday(getWeekDates(selectedDate)[dayIndex]) }]"
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
  font-size: 2.4rem;
  font-weight: 800;
  color: #213b75;
  text-align: center;
  font-family: 'Urbanist', 'Nunito', sans-serif;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}
h1::after{
  content: '';
  display: block;
  margin: 0 auto;
  width: 180px;
  height: 4px;
  background: linear-gradient(to right, #6db4ff, #007bff);
  border-radius: 2px;
}


.timetable-container {
  background: linear-gradient(135deg, #eaf1fe, #e8f0ff);
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Nunito', sans-serif;
  color: #333;
}

.filter-container {
  margin: 0 auto;
  width: 80%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 2rem;
  background: #ffffffee;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 64, 128, 0.08);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.filters-left {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: center;
  min-width: 320px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}


.filter-item select,
.filter-item input[type="date"] {
  padding: 8px 12px;
  font-size: 14px;
  background-color: #f6faff;
  border: 2px solid transparent;
  border-radius: 0.6rem;
  transition: border-color 0.2s ease;
}

.filter-item select:focus,
.filter-item input[type="date"]:focus {
  border-color: #4d8eff;
  outline: none;
}

.filters-right {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  gap: 10px;
  min-width: 300px;
  justify-content: flex-end;
}

.filters-right button {
  background-color: #0787e1;
  color: #fff;
  padding: 10px 16px;
  border-radius: 0.6rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  transition: 0.2s;
}

.filters-right button:hover {
  background-color: #0065d1;
  transform: translateY(-2px);
}

.holiday-label {
  font-size: 12px;
  color: #d04444;
  font-weight: 600;
  margin-top: 4px;
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
  background: rgba(251, 253, 255, 0.823);
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
  margin: 0 auto;
}

th,
td {
  border: 1px solid var(--color-border);
  padding: 13px;
  text-align: center;
  vertical-align: middle;
}

th {
  background: #f8f9fb9a;
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
  color: #5c5c5c;
}
.time-label span {
  font-size: 18px;
  color: #303030;
  font-weight: 400;
  font-weight: bold;
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
  background-color: #ffffffee;
  border-radius: 1.2rem;
  box-shadow: 0 8px 24px rgba(0, 64, 128, 0.1);
  padding: 1rem;
  overflow-x: auto;
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
.holiday-column {
  background-color: #fff1f1 !important; /* 연한 빨간색 배경 */
}

</style>

