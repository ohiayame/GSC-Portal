<template>
  <div class="home-container">
    <h1>GSC Portal</h1>
    <div class="grid">
      <div>
      <!-- 📢 공지사항 -->
      <div class="notice-list">
        <h2>📢 공지사항</h2>

        <div v-if="slicedNotices.length > 0">
          <div
            v-for="notice in slicedNotices"
            :key="notice.id"
            :class="['notice-card', getTargetClass(notice.target)]"
            @click="goToNotice(notice.id)"
            style="cursor: pointer;"
          >
            <div class="notice-card-title">
              <span v-if="notice.priority === 'pinned'">📌</span> {{ notice.title }}
            </div>
            <p class="notice-card-meta">
              {{ notice.course_name ? notice.course_name : noticeStore.getTargetLabel(notice.target) }} |
              {{ formatDate(notice.created_at) }}
            </p>
          </div>


          <router-link to="/notices" class="see-all">전체 공지 보기 →</router-link>
        </div>
        <p v-else>📌 등록된 공지사항이 없습니다.</p>
      </div>

      <div class="line-button-wrapper">
        <button class="line-register-btn" @click="showModal = true">LINE 연동하기</button>
      </div>

    </div>



      <!-- 📅 이번 주 1학년 시간표 -->
      <div class="timetable">
        <h2>📅 정규 시간표</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th v-for="day in week" :key="day">{{ day }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="period in periods" :key="period">
              <td class="time">{{ period }}교시</td>
              <template v-for="day in weekDays" :key="`${day}-${period}`">
                <td
                  v-if="shouldRenderCell(day, period)"
                  :rowspan="getDuration(day, period)"
                  :class="{ highlight: getClassAt(day, period) }"
                >
                  <span v-if="getClassAt(day, period)">{{ getClassAt(day, period) }}</span>
                  <span v-else class="empty">-</span>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <LineLinkModal :show="showModal" @close="showModal = false" />
</template>

<script setup>
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import { useRouter } from 'vue-router';
import { useNoticesStore } from "@/stores/notices";
import { useTimetableStore } from "@/stores/timetable";
import { useAuthStore } from "@/stores/auth";
import LineLinkModal from '@/components/LineLinkModal.vue';

const auth = useAuthStore();
const user = computed(() => auth.user);
const router = useRouter();

// ✅ 공지사항 상태 가져오기 (Pinia 활용)
const noticeStore = useNoticesStore();
const { notices } = storeToRefs(noticeStore);
const showModal = ref(false);

// ✅ 공지사항 정렬 (고정 공지는 상단에 표시)
const sortedNotices = computed(() =>
  [...notices.value].sort((a, b) => (a.priority === "pinned" ? -1 : 1))
);

async function test() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn("❗ 토큰이 비어 있습니다. 로그인 이후에 실행하세요.");
    return;
  }

  const res = await fetch("http://localhost:3001/line/issue-code", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` // ⭕ 토큰만 보내면 됨
    },
  });

  if (!res.ok) {
    console.error("❌ 서버 응답 실패:", res.status);
    return;
  }

  const data = await res.json();
  console.log("✅ 발급된 연동 코드:", data.code);

  // 👉 여기에 UI에 표시하거나, 클립보드 복사 등도 가능
  alert(`📋 연동 코드: ${data.code}`);
};

// ✅ 1학년 시간표 상태 가져오기 (Pinia 활용)
const timetableStore = useTimetableStore();
const { timetables } = storeToRefs(timetableStore);
console.log("timetables", timetables.value);

const week = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const weekDays = ["월", "화", "수", "목", "금"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

onMounted(() => {
  noticeStore.fetchNotices(); // 공지사항 불러오기
  timetableStore.fetchTimetables(); // 전체 시간표 불러오기
});
const today = new Date();
const inPeriod = (cls) =>
  new Date(cls.start_date) <= today && new Date(cls.end_date) >= today;


// ✅ 특정 요일, 교시에 해당하는 1학년 수업 찾기
const getClassAt = (day, period) => {
  const session = timetables.value.find(
    (cls) => cls.day === day && cls.period === period && cls.grade === user.value?.grade && inPeriod(cls)
  );
  return session ? session.course_name : "";
};

// ✅ 병합된 셀을 고려하여 `<td>` 렌더링 여부 결정
  const shouldRenderCell = (day, period) => {
  const session = timetables.value.find(
    (cls) =>
      cls.day === day &&
      cls.period === period &&
      cls.grade === user.value?.grade &&
      inPeriod(cls)
  );

  if (session) {
    return true; // 병합 시작 교시만 출력
  }

  return !timetables.value.some(
    (cls) =>
      cls.day === day &&
      cls.grade === user.value?.grade &&
      inPeriod(cls) &&
      cls.period < period &&
      cls.period + cls.duration - 1 >= period
  );
};

// ✅ 해당 수업의 지속 시간(duration) 반환 (최소 1교시)
const getDuration = (day, period) => {
  const session = timetables.value.find(
    (cls) =>
      cls.day === day &&
      cls.period === period &&
      cls.grade === user.value?.grade &&
      inPeriod(cls) // 🔥 추가: 기간 안에 있는 수업만 처리
  );
  return session ? session.duration || 1 : 1;
};



// ✅ 최근 공지 5개만 가져오기
const slicedNotices = computed(() =>
  sortedNotices.value
    .map(notice => {
      const course = timetableStore.timetables.find(
        (c) => c.course_id === notice.course_id
      );
      return {
        ...notice,
        course_name: course ? course.course_name : null
      };
    })
    .filter(notice =>
      notice.target === 0 || notice.target === user.value?.grade
    )
    .slice(0, 5)
);



// ✅ 날짜 포맷용 함수
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString();

const goToNotice = (id) => {
  router.push(`/notices/${id}`);
};
const getTargetClass = (target) => {
  switch (target) {
    case 0: return 'all';
    case 1: return 'first';
    case 2: return 'second';
    case 3: return 'third';
    case 4: return 'intl';
    default: return '';
  }
};

</script>


<style scoped>
/* 📌 전체 레이아웃 */
.home-container {
  background: linear-gradient(135deg, #f0f5ff, #e8f0ff);
  height: 100vh;
  padding: 2rem;
}
h1 {
  font-size: 2.2rem;
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
  margin-bottom: 5%;
  width: 200px;
  height: 4px;
  background: linear-gradient(to right, #6db4ff, #007bff);
  border-radius: 2px;
}


/* 📌 공지사항 + 시간표 그리드 */
.grid {
  display: flex;
  gap: 50px;
  justify-content: center;
  flex-wrap: wrap;
  align-items: flex-start;
}


/* 📌 공지사항 스타일 */
.notice-list {
  background: #ffffff;
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 320px;
  height: 550px;
  text-align: left;
}
.notice-card {
  background-color: #fff;
  border-left: 6px solid #007bff; /* 기본 색상 */
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  width: 270px; /* 🔹 폭 줄이기 */
  min-height: 5px; /* 🔹 높이 줄이기 */
  transition: transform 0.2s ease;
}
.notice-card:hover {
  transform: translateY(-3px);
}
.notice-card.all     { border-left-color: #007bff; background-color: #f0f8ff; }
.notice-card.first   { border-left-color: #28a745; background-color: #f6fff5; }
.notice-card.second  { border-left-color: #ffc107; background-color: #fffdeb; }
.notice-card.third   { border-left-color: #dc3545; background-color: #fff5f5; }
.notice-card.intl    { border-left-color: #8e44ad; background-color: #f7f0ff;
}
.notice-card-title {
  font-size: 15px;
  font-weight: bold;
  color: #1e6eea;
  text-decoration: none;
}

.notice-card-title:hover {
  text-decoration: underline;
}

.notice-card-meta {
  margin-top: 4px;
  font-size: 13px;
  color: #777;
}


/* 📌 공지사항 리스트 */
.notice-list ul {
  list-style: none;
  padding: 0;
}

.notice-list li {
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}


.index-number {
  font-weight: bold;
  color: #555;
}

.pinned {
  color: #ff5733;
  font-weight: bold;
}

.notice-list a {
  text-decoration: none;
  color: #000000;
  font-weight: bold;
}

.notice-list a:hover {
  text-decoration: underline;
}

.notice-item {
  margin-bottom: 12px;
}

.notice-title {
  font-weight: bold;
  color: #1e6eea;
  text-decoration: none;
  display: inline-block;
  margin-bottom: 2px;
}

.notice-title:hover {
  text-decoration: underline;
}

.notice-meta {
  font-size: 13px;
  color: #777;
}

.see-all {
  display: block;
  text-align: right;
  margin-top: 30px;
  margin-bottom: 10px;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  padding-right: 4px;
}

.see-all:hover {
  text-decoration: underline;
  color: #003e91;
}

.line-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.line-register-btn {
  padding: 20px 30px;
  background-color: #00C300;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  transition: 0.2s ease-in-out;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.line-register-btn:hover {
  background-color: #00a700;
  transform: translateY(-1px);
}



/* 📌 시간표 스타일 */
.timetable {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 50%;
  text-align: center;
}

.timetable table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
}

.timetable th,
.timetable td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
  font-size: 12px;
  min-width: 50px;
  height: 50px;
}
.timetable th {
  background: #d3e8ff;
  color: rgb(75, 75, 75);
  font-weight: bold;
  font-size:15px;
}

.timetable td {
  background: #f9f9f9;
  transition: background 0.2s ease-in-out;
}

.timetable td.highlight {
  background: #e3f2fd;
  font-weight: bold;
}

.timetable .empty {
  color: #ccc;
}

</style>
