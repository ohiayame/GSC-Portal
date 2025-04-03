<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h3>🎯 분반 등록 대상 선택</h3>
      <label>학년 선택:
        <select v-model="selectedGrade">
          <option value="0">전체</option>
          <option value="1">1학년</option>
          <option value="2">2학년</option>
          <option value="3">3학년</option>
          <option value="4">한국어</option>
        </select>
      </label>
      <div class="select-container">
      <!-- 왼쪽: 체크박스 -->
      <div class="course-checkboxes">
        <label v-for="course in timetableStore.availableCourses" :key="course.course_id">
          <input type="checkbox" :value="course" v-model="selectedCourses" />
          {{ course.course_name }}
          <span v-if="course.class_section">({{ course.class_section }}반)</span>
        </label>
      </div>

      <!-- 오른쪽: 선택된 과목 태그 -->
      <div class="selected-tags">
        <div v-for="course in selectedCourses" :key="course.course_id" class="tag">
          {{ course.course_name }}
          <span class="tag-close" @click="removeCourse(course)">×</span>
        </div>
      </div>
    </div>

      <div class="modal-buttons">
        <button @click="$emit('close')">닫기</button>
        <button @click="confirmSelection">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTimetableStore } from "@/stores/timetable"; // 모든 과목 불러오는 store 예시

const selectedGrade = ref(1);
const selectedCourses = ref([]);
const timetableStore = useTimetableStore();

const emit = defineEmits(["close", "confirm"]);

const filteredCourses = computed(() =>
  timetableStore.timetables.filter(course =>
    course.grade == selectedGrade.value && (course.type === "special" || course.class_section !== null)
  )
);

const removeCourse = (courseToRemove) => {
  selectedCourses.value = selectedCourses.value.filter(
    (c) => c.course_id !== courseToRemove.course_id
  );
};

const confirmSelection = () => {
  if (selectedCourses.value.length > 0) {
    const courseList = selectedCourses.value;

    // 부모로 emit
    emit("confirm", { courses: courseList });
  }
};

watch(selectedGrade, async (newGrade) => {
  await timetableStore.fetchAvailableCourses(newGrade);
});

onMounted(async () => {
  // timetableStore.fetchTimetables();
  await timetableStore.fetchAvailableCourses(selectedGrade.value);
});

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4); /* 배경 어둡게 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  text-align: center;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.modal-content h3 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #ff4d4f;
}

.modal-content label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  text-align: left;
}

.modal-content select {
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
}


.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.modal-buttons button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.modal-buttons button:first-child {
  background-color: #f0f0f0;
}

.modal-buttons button:last-child {
  background-color: #3ca1ff;
  color: white;
}
/* 아예 제거하거나 */
.select-container {
  display: block;
  margin-bottom: 16px;
}


.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}


.course-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.tag {
  background-color: #eaf6ff;
  border: 1px solid #d0e8f9;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.tag-close {
  margin-left: 6px;
  cursor: pointer;
  color: #888;
  font-weight: bold;
}
.tag-close:hover {
  color: #ff4d4f;
}


</style>
