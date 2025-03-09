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
const deleteTt = async (course_id) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  await store.deleteTimetable(course_id);
  console.log("📌 id값 :", course_id);
  alert("삭제 완료!");
};

// ✅ 시간표 수정 페이지로 이동
const editTimetable = (timetable) => {
  console.log("📌 id값 :", timetable.course_id);
  router.push({
    path: `/timetable/edit/${timetable.course_id}`,
    query: {
      course_id: timetable.course_id,
      course_name: timetable.course_name,
      professor: timetable.professor,
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
    <button  @click="$router.push('/timetable/new')" class="new-btn">새 시간표 등록</button>

    <div v-if="isLoading">⏳ 데이터 불러오는 중...</div>
    <div v-else-if="store.timetables.length === 0">📭 등록된 시간표가 없습니다.</div>

    <div v-else>
      <table  class="timetable">
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
          <tr v-for="timetable in store.timetables" :key="timetable.course_id">
            <td>{{ timetable.grade }}</td>
            <td>{{ timetable.course_name }}</td>
            <td>{{ timetable.professor }}</td>
            <td>{{ timetable.day }}</td>
            <td>{{ timetable.period }}교시
              <span>({{ timetable.duration }}시간)</span></td>
            <td>{{ timetable.location }}</td>
            <td>{{ timetable.start_date.split("T")[0] }} ~ <br>{{ timetable.end_date.split("T")[0] }}</td>
            <td><button class="edit-btn" @click="editTimetable(timetable)">✏️ 수정</button></td>
            <td><button class="delete-btn" @click="deleteTt(timetable.course_id)">🗑 삭제</button></td>
          </tr>
        </tbody>
      </table>
  </div>
</div>
  <div class="bottom-button-container">
    <button @click="router.push('/timetable')" class="back">돌아가기</button>
  </div>
</template>

<style scoped>
.manage-container {
  width: auto;
  max-width: 850px;
  margin: 20px auto;
  text-align: center;
}

.timetable {
  width: auto;
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

.bottom-button-container {
  display: flex;
  justify-content: flex-start;
  margin-top: 15px;
  margin-left: 65px;
}

/* ✅ 새 시간표 등록 버튼 스타일 적용 */
.new-btn {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
  padding: 8px 12px;
  font-size: 14px;
  background-color: #485ff7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

}

.new-btn:hover {
  background-color: #5fb7ff;
}

/* ✅ 수정 & 삭제 버튼 스타일 */
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

/* ✅ 돌아가기 버튼 스타일 */
.back {
  background-color: #ccc;
  color: black;
  padding: 6px 20px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back:hover {
  background-color: #b3b3b3;
}
</style>
