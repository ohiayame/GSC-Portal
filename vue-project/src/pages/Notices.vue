<script setup>
import { onMounted, computed, watch, ref } from "vue";
import { useNoticesStore } from "../stores/notices";
import { useTimetableStore } from "../stores/timetable";
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const user = computed(() => auth.user);

const store = useNoticesStore();
const timetableStore = useTimetableStore();

// ✅ 선택한 학년에 맞는 과목 필터링 (과목 선택 리스트용)
const filteredCourses = computed(() => {
  return timetableStore.timetables.filter(course =>
    store.searchTarget === 0 || course.grade == store.searchTarget
  );
});

// ✅ 검색된 공지 목록 (학년 + 과목 + 키워드 필터 적용)
const filteredNotices = computed(() => {
  return store.notices.filter(notice => {
    const matchesTarget = store.searchTarget === 0 || notice.target == store.searchTarget;
    const matchesCourse = store.searchCourse === "" || notice.course_id == store.searchCourse;
    const matchesKeyword =
      store.searchKeyword.trim() === "" ||
      notice.title.toLowerCase().includes(store.searchKeyword.toLowerCase()) ||
      notice.content.toLowerCase().includes(store.searchKeyword.toLowerCase());

    return matchesTarget && matchesCourse && matchesKeyword;
  });
});

const filteredNoticesWithCourses = computed(() => {
  return filteredNotices.value
  .map(notice => {
    const course = timetableStore.timetables.find(course => course.course_id === notice.course_id);
    return {
      ...notice,
      course_name: course ? course.course_name : "" // ✅ course_id에 맞는 과목명 찾기
    };
  })
  .sort((a, b) => {
    // ✅ priority가 'pinned'인 공지를 먼저 배치
    if (a.priority === 'pinned' && b.priority !== 'pinned') return -1;
    if (a.priority !== 'pinned' && b.priority === 'pinned') return 1;
    return new Date(b.created_at) - new Date(a.created_at); // 기본 정렬 (최신순)
  });
});

// 페이지
const currentPage = ref(1);              // 현재 페이지
const itemsPerPage = 15;                 // 한 페이지당 15개
const totalPages = computed(() =>
  Math.ceil(filteredNoticesWithCourses.value.length / itemsPerPage)
);

// 현재 페이지에 해당하는 공지 추출
const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredNoticesWithCourses.value.slice(start, end);
});

// 페이지가 바뀌거나 필터가 바뀌면 페이지를 1로 리셋
watch([() => store.searchTarget, () => store.searchCourse, () => store.searchKeyword], () => {
  currentPage.value = 1;
});
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  const start = Math.max(current - 1, 1);
  const end = Math.min(current + 1, total);

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < total - 1) pages.push('...');
  }

  return pages;
});




watch(() => store.searchTarget, (newTarget) => {
  // 학년이 변경되었을 때 다른 학년 과목선택 예방방
  const availableCourses = timetableStore.timetables.filter(course =>
    newTarget === 0 || course.grade == newTarget
  );
  // 다른 학년 선택시 과목 초기화
  if (!availableCourses.some(course => course.course_id == store.searchCourse)) {
    store.searchCourse = "";
  }
  // 전체로 했을 때 과목 초기화
  if (newTarget === 0) {
    store.searchCourse = "";
  }
});


// ✅ 페이지 로드 시 공지사항 가져오기
onMounted(() => {
  store.fetchNotices();
  timetableStore.fetchTimetables();
});

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString();
</script>

<template>
  <div>
    <h1>공지사항</h1>
    <div class="notice-top-bar">
      <!-- ✅ 검색 필터 UI -->
      <div class="search-bar">
        <label for="target">검색: </label>
        <select id="target" v-model="store.searchTarget">
          <option :value="0">전체</option>
          <option :value="1">1학년</option>
          <option :value="2">2학년</option>
          <option :value="3">3학년</option>
        </select>

        <!-- ✅ 학년 선택 시 해당 학년의 과목만 표시 -->
        <select v-model="store.searchCourse">
          <option value="">전체 공지</option>
          <option v-for="course in filteredCourses"
            :key="course.course_id" :value="course.course_id">
            {{ course.course_name }}
            <template v-if="course.class_section !== null">({{ course.class_section }}반)</template>
          </option>
        </select>

        <input
          type="text"
          placeholder="제목 검색..."
          v-model="store.searchKeyword"
        />
      </div>
      <button v-if="user.role !== '학생'" @click="$router.push('/notices/new')">새 공지 작성</button>
    </div>
    <table border="1">
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>대상</th>
          <th>과목</th>
          <th>작성일</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(notice, index) in paginatedNotices"
            :key="notice.id"
            :class="{'pinned-row': notice.priority === 'pinned'}">
          <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
          <td><router-link :to="'/notices/' + notice.id">{{ notice.title }}</router-link></td>
          <td>{{ store.getTargetLabel(notice.target) }}</td>
          <td>{{ notice.course_name }}</td>
          <td>{{ formatDate(notice.created_at) }}</td>
        </tr>
      </tbody>

    </table>
  </div>

  <div class="pagination">
    <button @click="currentPage = 1" :disabled="currentPage === 1">«</button>
    <button @click="currentPage--" :disabled="currentPage === 1">‹</button>

    <button
  v-for="(page, idx) in visiblePages"
  :key="idx"
  :class="{ active: currentPage === page }"
  @click="typeof page === 'number' && (currentPage = page)"
  :disabled="page === '...'"
>
  {{ page }}
</button>

    <button @click="currentPage++" :disabled="currentPage === totalPages">›</button>
    <button @click="currentPage = totalPages" :disabled="currentPage === totalPages">»</button>
  </div>

</template>

<style scoped>
:root {
  --color-main: #007bff;
  --color-bg: #f9fafe;
  --color-border: #e0e6ed;
  --color-hover: rgba(0, 123, 255, 0.08);
  --color-button-text: #fff;
  --color-time: #f1f3f5;
}

h1 {
  text-align: center;
  color: rgb(60, 161, 255);
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 24px;
}

.notice-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  padding: 0 16px;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.search-bar label {
  font-weight: 600;
  margin-right: 5px;
}

.search-bar select,
.search-bar input {
  padding: 5px 10px;
  min-width: 120px;
  font-size: 14px;
  border: 2px solid #5fa2d200;
  border-radius: 6px;
  background-color: #f6faff;
  transition: border-color 0.2s;
}

.search-bar select:focus,
.search-bar input:focus {
  border-color: #4d8eff;
  outline: none;
}

button {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  background-color: var(--color-main);
  color: var(--color-button-text);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(122, 186, 255, 0.468);
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.417);
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
  font-size: 14px;
}

th {
  background-color: #eef4fb;
  color: #333;
  font-weight: 600;
  padding: 14px;
  text-align: center;
}

td {
  padding: 14px 10px;
  border-bottom: 1px solid #eee;
  color: #333;
  text-align: center;
}

tbody tr:hover {
  background-color: #f6faff;
  transition: background-color 0.3s ease;
}

.pinned-row {
  background-color: #fff8ef;
  font-weight: 600;
}

.pinned-row td:first-child::before {
  content: "📌 ";
}

a {
  color: #1a4dc2;
  text-decoration: none;
  font-weight: 500;
}
a:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
  gap: 5px;
}

.pagination button {
  padding: 8px 14px;
  min-width: 36px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #d0d7de;
  background-color: white;
  color: #333;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.pagination button:hover:not(:disabled) {
  background-color: #eaf4ff;
  border-color: #1e6eea;
  color: #1e6eea;
}

.pagination button.active {
  background-color: #1e6eea;
  color: white;
  border-color: #1e6eea;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

</style>
