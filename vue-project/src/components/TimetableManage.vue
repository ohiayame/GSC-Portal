<script setup>
import { ref, onMounted } from "vue";
import { useTimetableStore } from "../stores/timetable";
import { useRouter } from "vue-router";

const store = useTimetableStore();
const router = useRouter();
const isLoading = ref(true);

// ✅ 페이지 로드시 시간표 데이터 불러오기
onMounted(async () => {
  await store.fetchTimetables();
  isLoading.value = false;
});

// ✅ 시간표 삭제 함수
const deleteTt = async (id) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  await store.deleteTimetable(id);
  console.log("📌 id값 :", id);
  alert("삭제 완료!");
};

// ✅ 시간표 수정 페이지로 이동
const editTimetable = (timetable) => {
  router.push({
    path: `/timetable/edit/${timetable.course_id}`,
    query: {
      id: timetable.id,
      course_id: timetable.course_id,
      course_name: timetable.course_name,
      professor: "",
      grade: timetable.grade,
      class_section: timetable.class_section,
      type: timetable.type,
      day: timetable.day,
      period: timetable.period,
      duration: timetable.duration,
      location: timetable.location,
      start_date: timetable.start_date.split("T")[0] ,
      end_date: timetable.end_date.split("T")[0] ,
    },
  });
};
</script>

<template>
  <div class="manage-container">
    <h2>시간표 관리</h2>

    <div v-if="isLoading">⏳ 데이터 불러오는 중...</div>
    <div v-else-if="store.timetables.length === 0">📭 등록된 시간표가 없습니다.</div>

    <table v-else class="timetable">
      <thead>
        <tr>
          <th>학년</th>
          <th>과목명</th>
          <th>교수명</th>
          <th>요일</th>
          <th>교시</th>
          <th>강의실</th>
          <th>기간</th>
          <th>수정</th>
          <th>삭제</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="timetable in store.timetables" :key="timetable.id">
          <td>{{ timetable.grade }}</td>
          <td>{{ timetable.course_name }}</td>
          <td>{{ timetable.professor }}</td>
          <td>{{ timetable.day }}</td>
          <td>{{ timetable.period }}교시
            <span>({{ timetable.duration }}시간)</span></td>
          <td>{{ timetable.location }}</td>
          <td>{{ timetable.start_date.split("T")[0] }} ~ {{ timetable.end_date.split("T")[0] }}</td>
          <td><button class="edit-btn" @click="editTimetable(timetable)">✏️ 수정</button></td>
          <td><button class="delete-btn" @click="deleteTt(timetable.course_id)">🗑 삭제</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.manage-container {
  width: 90%;
  max-width: 800px;
  margin: 20px auto;
  text-align: center;
}

.timetable {
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

.edit-btn, .delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background-color: #ffc107;
  color: black;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.edit-btn:hover {
  background-color: #ffb300;
}

.delete-btn:hover {
  background-color: #d32f2f;
}
</style>
