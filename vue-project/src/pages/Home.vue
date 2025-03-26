<template>
  <div class="home-container">
    <h1>GSC Portal</h1>
    <div class="grid">
      <!-- 📢 공지사항 -->
      <div class="notice-list">
        <h2>📢 공지사항</h2>

        <div v-if="slicedNotices.length > 0">
          <div v-for="notice in slicedNotices" :key="notice.id" class="notice-item">
            <router-link :to="`/notices/${notice.id}`" class="notice-title">
              <span v-if="notice.priority === 'pinned'">📌</span>
              {{ notice.title }}
            </router-link>
            <div class="notice-meta">
              {{ notice.course_name ? notice.course_name : noticeStore.getTargetLabel(notice.target) }} |
              {{ formatDate(notice.created_at) }}
            </div>
          </div>
          <router-link to="/notices" class="see-all">전체 공지 보기 →</router-link>
        </div>
        <p v-else>📌 등록된 공지사항이 없습니다.</p>
      </div>

      <!-- 📅 이번 주 1학년 시간표 -->
      <div class="timetable">
        <h2>📅 정규 시간표</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th v-for="day in weekDays" :key="day">{{ day }}</th>
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
</template>

<script setup>
import { storeToRefs } from "pinia";
import { computed, onMounted } from "vue";
import { useNoticesStore } from "@/stores/notices";
import { useTimetableStore } from "@/stores/timetable";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const user = computed(() => auth.user);

// ✅ 공지사항 상태 가져오기 (Pinia 활용)
const noticeStore = useNoticesStore();
const { notices } = storeToRefs(noticeStore);

// ✅ 공지사항 정렬 (고정 공지는 상단에 표시)
const sortedNotices = computed(() =>
  [...notices.value].sort((a, b) => (a.priority === "pinned" ? -1 : 1))
);

// ✅ 1학년 시간표 상태 가져오기 (Pinia 활용)
const timetableStore = useTimetableStore();
const { timetables } = storeToRefs(timetableStore);
console.log("timetables", timetables.value);

const weekDays = ["월", "화", "수", "목", "금"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

onMounted(() => {
  noticeStore.fetchNotices(); // 공지사항 불러오기
  timetableStore.fetchTimetables(); // 전체 시간표 불러오기
});

// ✅ 특정 요일, 교시에 해당하는 1학년 수업 찾기
const getClassAt = (day, period) => {
  const session = timetables.value.find(
    (cls) => cls.day === day && cls.period === period && cls.grade === user.value?.grade
  );
  return session ? session.course_name : "";
};

// ✅ 병합된 셀을 고려하여 `<td>` 렌더링 여부 결정
const shouldRenderCell = (day, period) => {
  const session = timetables.value.find(
    (cls) => cls.day === day && cls.period === period && cls.grade === user.value?.grade
  );

  if (!session) {
    // ✅ 현재 교시가 병합된 수업의 범위 내에 있는지 확인
    return !timetables.value.some(
      (cls) =>
        cls.day === day &&
        cls.period < period &&
        cls.period + (cls.duration - 1) >= period &&
        cls.grade === user.value?.grade
    );
  }

  // ✅ 병합된 첫 번째 교시만 `<td>`를 생성하고, 이후 교시는 `<td>` 생성 안 함
  return period === session.period;
};

// ✅ 해당 수업의 지속 시간(duration) 반환 (최소 1교시)
const getDuration = (day, period) => {
  const session = timetables.value.find(
    (cls) => cls.day === day && cls.period === period && cls.grade === user.value?.grade
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

</script>


<style scoped>
/* 📌 전체 레이아웃 */
.home-container {
  text-align: center;
  padding: 20px;
}

/* 📌 공지사항 + 시간표 그리드 */
.grid {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 📌 공지사항 스타일 */
.notice-list {
  background: #ffffff;
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 320px;
  height: 400px ;
  text-align: left;
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
  color: #007bff;
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
  margin-top: 10px;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  padding-right: 4px;
}

.see-all:hover {
  text-decoration: underline;
  color: #003e91;
}



/* 📌 시간표 스타일 */
.timetable {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 500px;
  text-align: center;
}

.timetable table {
  width: 90%;
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
  background: #65b0ff;
  color: white;
  font-weight: bold;
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

h1{
  color: rgb(60, 161, 255);
}
</style>
