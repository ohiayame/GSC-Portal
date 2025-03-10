<script setup>
import { onMounted, computed, watch } from "vue";
import { useNoticesStore } from "../stores/notices";
import { useTimetableStore } from "../stores/timetable";

const store = useNoticesStore();
const timetableStore = useTimetableStore();

// ✅ 선택한 학년에 맞는 과목 필터링 (과목 선택 리스트용)
const filteredCourses = computed(() => {
  return timetableStore.timetables.filter(course => store.searchTarget === 0 || course.grade == store.searchTarget);
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

watch(() => store.searchTarget, (newTarget) => {
  if (newTarget === 0) {
    store.searchCourse = "";
  }
});

// ✅ 페이지 로드 시 공지사항 가져오기
onMounted(() => {
  store.fetchNotices();
  timetableStore.fetchTimetables();
});
</script>

<template>
  <div>
    <h1>공지사항</h1>
    <button @click="$router.push('/notices/new')">새 공지 작성</button>

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
        <option v-for="course in filteredCourses" :key="course.course_id" :value="course.course_id">
          {{ course.course_name }}
        </option>
      </select>

      <input
        type="text"
        placeholder="제목 검색..."
        v-model="store.searchKeyword"
      />
    </div>

    <table border="1">
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>대상</th>
          <th>작성일</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(notice, index) in filteredNotices" :key="notice.id">
          <td>{{ index + 1 }}</td>
          <td>
            <router-link :to="'/notices/' + notice.id">
              {{ notice.title }}
            </router-link>
          </td>
          <td>{{ store.getTargetLabel(notice.target) }}</td>
          <td>{{ new Date(notice.created_at).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  margin-top: 15px;
}

.search-bar label {
  font-weight: bold;
}

.search-bar select,
.search-bar input {
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-bar select {
  min-width: 100px;
}

th, td {
  padding: 8px;
  text-align: center;
  border: 1px solid #ddd;
}

th {
  background-color: #c5d3e6;
}

button {
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  background-color: #4d8eff;
  color: white;
  cursor: pointer;
}
</style>
