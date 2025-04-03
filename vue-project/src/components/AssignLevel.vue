<template>
  <div class="page-wrapper">
    <!-- 📚 명단 -->
    <div class="roster-area">
    <template  v-for="grade in [1, 2, 3]" :key="grade">
    <div
      v-if="selectedGrade === null || selectedGrade === grade"
      class="grade-roster"
    >
        <h3>{{ grade }}학년</h3>
        <Draggable
          :list="students.filter(s => s.grade === grade && !isAssigned(s.id))"
          group="students"
          itemKey="id"
          class="draggable-list"
        >
          <template #item="{ element }">
            <div class="student-item" :class="`grade-${element.grade}`">
              {{ element.name }}</div>
          </template>
        </Draggable>
      </div>
    </template>
  </div>

    <!-- 🧩 분반 배정 -->
    <div class="assignment-area">
      <h2>분반 배정</h2>
      <div class="assign-box">
  <div
    class="assign-column"
    v-for="course in selectedCourses"
    :key="course.course_id"
  >
    <h3>{{ course.course_name }}
      <span v-if="course.class_section"> ({{ course.class_section }}반)</span>
    </h3>

    <Draggable
      v-model="assigned[course.course_id]"
      group="students"
      itemKey="id"
      class="drop-zone"
    >
      <template #item="{ element }">
        <div class="student-item" :class="`grade-${element.grade}`">
          {{ element.name }}
        </div>
      </template>
    </Draggable>
  </div>


      </div>
    </div>

    <button @click="router.push('/approval')" class="back">돌아가기</button>
    <button @click="submit" class="submit-button">📝 등록</button>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from "vue-router";
import Draggable from 'vuedraggable'
import { useAuthStore } from "@/stores/auth"
import { useAssignLevelStore } from "@/stores/assignLevel";
import { storeToRefs } from "pinia";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const assignStore = useAssignLevelStore();
const { selectedCourses, assigned } = storeToRefs(assignStore);

const students = ref([]);
// const assigned = ref({});  // 🔹 key: course_id, value: 학생 배열
const groupId = computed(() => route.query.group_id);


console.log("selectedCourses", selectedCourses)

// ✅ 학년순 정렬 함수
const sortByGrade = (arr) => {
  arr.sort((a, b) => a.grade - b.grade);
};
const isAssigned = (id) => {
  return Object.values(assigned.value).flat().some(s => s.id === id);
};

const selectedGrade = computed(() => {
  if (selectedCourses.value.length === 0) return null;

  const grades = selectedCourses.value.map(c => c.grade);
  if (grades.includes(0)|| grades.includes(4)) return null; // 전체 학년 표시

  const first = grades[0];
  const allSame = grades.every(g => g === first);
  return allSame ? first : null;  // 모두 같은 경우만 특정 학년
});

const submit = async () => {
  const assignments = [];

  for (const [course_id, studentsInCourse] of Object.entries(assigned.value)) {
    studentsInCourse.forEach(student => {
      assignments.push({
        course_id: Number(course_id),
        student_id: student.id,
        grade: student.grade
      });
    });
  }

  await assignStore.submitAssignments(assignments);

  router.push("/approval");
};


onMounted(async () => {
  await auth.fetchPendingUsers();
  console.log("groupId.value", groupId.value)
  const isInternational = ref('no');
  if (groupId.value) {
    await assignStore.fetchAssignmentsByGroup(groupId.value);
  }else{
    // course_id별로 빈 배열 초기화
    selectedCourses.value.forEach(course => {
      assigned.value[course.course_id] = [];
    });

    if (selectedCourses.value.some(course => course.grade === 4)){
      isInternational.value = 'yes'
    }
  }
  students.value = auth.pendingUsers
    .filter(user =>
    user.role === "학생" && user.approved === 1 && user.international === isInternational.value )
    .map(user => ({ id: user.id, name: user.name, grade: user.grade }));
    console.log("승인된 학생 목록:", students.value);

});



</script>


<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  padding: 30px;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.roster-area {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
  width: 100%;
  max-width: 1200px; /* ✅ 추가하면 화면 중앙정렬에 도움 */
}

.grade-roster {
  flex: 1 1 300px;
  width: 360px;
  min-width: 240px;
  min-height: 420px;
  background-color: #ffffff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: 0.3s;
}

.grade-roster h3 {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  padding: 6px;
  border-radius: 8px;
  background-color: #e1ecf4;
  color: #0077cc;
}

.grade-roster:nth-child(1) h3 {
  background-color: #ffe0e0;
  color: #d93939;
}

.grade-roster:nth-child(2) h3 {
  background-color: #fff9dc;
  color: #c6a700;
}

.grade-roster:nth-child(3) h3 {
  background-color: #d8f5d5;
  color: #43a047;
}
/* 학년별 배경색 및 테두리 설정 */
.student-item.grade-1 {
  background-color: #ffecec;
  border: 1px solid #ffb3b3;
}

.student-item.grade-2 {
  background-color: #fffad6;
  border: 1px solid #ffe066;
}

.student-item.grade-3 {
  background-color: #e2fbe2;
  border: 1px solid #85e085;
}


.assignment-area {
  text-align: center;
  width: 100%;
}

.assignment-area h2 {
  font-size: 22px;
  font-weight: 800;
  color: #1890ff;
  margin-bottom: 12px;
}

.assign-box {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 10px;
}

.assign-column {
  flex: 1 1 260px;
  width: 300px;
  min-width: 240px;
}

.assign-column h3 {
  background-color: #e7f3ff;
  color: #007bff;
  padding: 8px;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
}

.drop-zone,
.draggable-list {
  display: flex;
  flex-wrap: wrap; /* ✅ 여러 줄 허용 */
  gap: 8px;
  min-height: 300px;
  max-height: 400px;
  width: 90%;
  overflow-y: auto;
  padding: 14px;
  border: 2px dashed #8ecdf3;
  border-radius: 10px;
  background-color: #fff;
  transition: background-color 0.2s;
}


.drop-zone:hover {
  background-color: #f1faff;
}

.student-item {
  flex: 0 0 calc(50% - 8px); /* ✅ 두 줄 배치: 너비를 50%로 설정 */
  box-sizing: border-box;
  height: 40px;
  background-color: #ffffff;
  padding: 10px 12px;
  margin: 0;
  border: 1px solid #cdd4da;
  border-radius: 8px;
  cursor: grab;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: 0.2s;
}

.student-item:hover {
  background-color: #e6f4ff;
}

.student-item:active {
  cursor: grabbing;
  transform: scale(1.02);
  background-color: #d2edff;
}

.submit-button {
  margin-top: 30px;
  padding: 14px 30px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
  transition: background-color 0.2s, transform 0.2s;
}

.submit-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

</style>
