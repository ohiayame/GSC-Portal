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
  <div class="page-wrapper">
    <h1 class="page-title">Notices</h1>

    <!-- 상단 필터 바 -->
    <div class="notice-filter-box">
      <div class="notice-filters">
        <label for="target">검색: </label>
        <select id="target" v-model="store.searchTarget">
          <option :value="0">전체</option>
          <option :value="1">1학년</option>
          <option :value="2">2학년</option>
          <option :value="3">3학년</option>
        </select>

        <select v-model="store.searchCourse">
          <option value="">전체 공지</option>
          <option
            v-for="course in filteredCourses"
            :key="course.course_id"
            :value="course.course_id"
          >
            {{ course.course_name }}
            <template v-if="course.class_section !== null">
              ({{ course.class_section }}반)
            </template>
          </option>
        </select>

        <input
          type="text"
          placeholder="제목 검색..."
          v-model="store.searchKeyword"
        />
      </div>

      <button
        v-if="user.role !== '학생'"
        @click="$router.push('/notices/new')"
        class="btn-create"
      >
        새 공지 작성
      </button>
    </div>

    <!-- 공지 테이블 -->
    <div class="notice-table-box">
      <table class="notice-table">
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
          <tr
            v-for="(notice, index) in paginatedNotices"
            :key="notice.id"
            :class="['notice-row', { pinned: notice.priority === 'pinned' }]"
          >
            <td>
              <span v-if="notice.priority === 'pinned'">📌 </span>
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>
            <td>
              <router-link :to="'/notices/' + notice.id">
                {{ notice.title }}
              </router-link>
            </td>
            <td>{{ store.getTargetLabel(notice.target) }}</td>
            <td>{{ notice.course_name }}</td>
            <td>{{ formatDate(notice.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
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
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;700&display=swap');

.page-wrapper {
  padding: 2rem;
  background: linear-gradient(135deg, #f0f5ff, #e8f0ff);
  min-height: 100vh;
  font-family: 'Nunito', sans-serif;
  color: #333;
}

.page-title {
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

.page-title::after {
  content: '';
  display: block;
  margin: 0 auto;
  width: 140px;
  height: 4px;
  background: linear-gradient(to right, #6db4ff, #007bff);
  border-radius: 2px;

}

.notice-filter-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  background: #ffffffee;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 64, 128, 0.08);
  margin-bottom: 1.5rem;
}

.notice-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;
}

.notice-filters select,
.notice-filters input {
  padding: 8px 12px;
  border: 2px solid transparent;
  border-radius: 0.6rem;
  background-color: #f6faff;
  transition: border-color 0.2s;
}

.notice-filters select:focus,
.notice-filters input:focus {
  border-color: #4d8eff;
  outline: none;
}

.btn-create {
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
.btn-create:hover {
  background-color: #0660c7;
}

/* 테이블 영역 */
.notice-table-box {
  background: #ffffffee;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 64, 128, 0.1);
}

.notice-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border-radius: 1rem;
  overflow: hidden;
  table-layout: fixed;
}

.notice-table th {
  background-color: #eef4fb;
  color: #213b75;
  padding: 14px;
  font-weight: 700;
  white-space: nowrap;
  height: 25px;
  border-bottom: 3px solid #aeb6c7cb;
}

.notice-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #eee;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;  /* 말줄임표 표시 (...) */
  max-width: 200px;
}


.notice-row:hover {
  background-color: #f6faff;
  transition: background-color 0.3s ease;
}

.notice-row.pinned {
  background-color: #fff8ef;
  font-weight: 600;
}

.notice-row a {
  color: #1a4dc2;
  text-decoration: none;
}
.notice-row a:hover {
  text-decoration: underline;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 6px;
}
.pagination button {
  padding: 8px 14px;
  min-width: 36px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #d0d7de;
  background-color: white;
  color: #333;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
