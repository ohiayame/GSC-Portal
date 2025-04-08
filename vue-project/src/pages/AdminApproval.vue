<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAssignLevelStore } from '@/stores/assignLevel.js'
import ModalChooseCourse from "@/components/ModalChooseCourse.vue";
import ModalChooseGroup from "@/components/ModalChooseGroup.vue";
import TimetableManage from "@/components/TimetableManage.vue";

const router = useRouter();
const auth = useAuthStore();
const level= useAssignLevelStore();

const showModal = ref(false);
const showGroupModal = ref(false);
const showTimetableModal = ref(false);

// 🔹 승인 및 거절 버튼 액션
const approveUser = (id) => auth.approveUser(id);
const rejectUser = (id) => auth.rejectUser(id);

const isLoading = ref(true);
const showOnlyPending = ref(true); // ✅ true면 승인 대기자만, false면 전체
const filteredUsers = computed(() => {
  if (showOnlyPending.value) {
    return auth.pendingUsers.filter(user => user.approved === 0);
  }
  return auth.pendingUsers;
});

// stores/auth.js의 updateRole(id, role)에 선택된 정보 전달
const updateRole = (id, role) => auth.updateRole(id, role);

const handleCourseSelection = ({ courses }) => {
  console.log("courses", courses);
  level.selectedCourses = courses;
  router.push("/assignLevel");
};
function handleGroupSelection(groupId) {
  showGroupModal.value = false;
  router.push({
  path: "/assignLevel",
  query: { group_id: groupId }
});

}


onMounted(async () => {
  await auth.fetchPendingUsers(); // 전체 유저 목록 불러오기
  isLoading.value = false;
});
</script>


<template>
  <div class="timetable-container">
    <h1>Management Page</h1>

    <!-- 기존 승인 대기 목록 -->
    <div class="approval-container">
      <h2>가입 승인 대기 목록</h2>
      <div class="filter-container">
        <input
          type="checkbox"
          id="togglePending"
          v-model="showOnlyPending"
          class="toggle-filter"
        />
        <label for="togglePending">승인 대기자만 보기</label>
      </div>

      <div v-if="isLoading">불러오는 중...</div>
      <table v-else>
        <thead>
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>이메일</th>
            <th>학번</th>
            <th>학년</th>
            <th>전화번호</th>
            <th>유학생 여부</th>
            <th>권한</th>
            <th>승인</th>
            <th>거절</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in filteredUsers" :key="user.id">
            <td>{{ index+1 }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.student_id || "-" }}</td>
            <td>{{ user.grade || "-" }}</td>
            <td>{{ user.phone || "-" }}</td>
            <td>{{ user.international }}</td>
            <td>
              <select v-model="user.role" @change="updateRole(user.id, user.role)">
                <option value="학생">학생</option>
                <option value="교수">교수</option>
                <option value="관리자">관리자</option>
              </select>
            </td>
            <td><button v-if="user.approved === 0" @click="approveUser(user.id)">✅ 승인</button></td>
            <td><button v-if="user.approved === 0" @click="rejectUser(user.id)">❌ 거절</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 분반 등록 -->
    <div class="assign-box">
      <h2>📚 분반 등록</h2>
      <p class="assign-description">
        학생들을 과목별로 분반에 등록하거나 수정할 수 있습니다.
      </p>
      <div class="mode-selector">
        <button @click="showModal = true" class="mode-btn new">➕ 신규 등록</button>
        <button @click="showGroupModal = true" class="mode-btn edit">✏️ 기존 수정</button>
      </div>
      <ModalChooseCourse v-if="showModal" @close="showModal = false" @confirm="handleCourseSelection" />
      <ModalChooseGroup v-if="showGroupModal" @close="showGroupModal = false" @confirm="handleGroupSelection" />
    </div>

    <!-- 시간표 카드 -->
    <div class="timetable-toggle-card">
      <div class="card-header" @click="showTimetableModal = !showTimetableModal">
        <h2>🗓️ 시간표 관리</h2>
        <span class="toggle-icon">{{ showTimetableModal ? '∧' : '∨' }}</span>
      </div>
      <transition name="expand">
        <div v-if="showTimetableModal" class="card-body">
          <TimetableManage mode="modal" />
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* 🔹 제목 및 배경 설정 */
h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #213b75;
  text-align: center;
  font-family: 'Urbanist', 'Nunito', sans-serif;
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
}
h1::after {
  content: '';
  display: block;
  margin: 0 auto;
  width: 335px;
  height: 4px;
  background: linear-gradient(to right, #6db4ff, #007bff);
  border-radius: 2px;
}

.timetable-container {
  background: linear-gradient(135deg, #f0f5ff, #e8f0ff);
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Nunito', sans-serif;
  color: #333;
}

.approval-container {
  padding: 30px;
  max-width: 80%;
  margin: 0px auto;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

h2 {
  text-align: center;
  color: #3ca1ff;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 16px;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-weight: 500;
  font-size: 14px;
}

.toggle-filter {
  transform: scale(1.2);
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
  background-color: #fdfdfd;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

th {
  background-color: #e1ecfa;
  font-weight: bold;
  padding: 14px;
  color: #2c3e50;
}

td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #eee;
  color: #333;
}

tbody tr:hover {
  background-color: #f4faff;
  transition: background-color 0.2s;
}

select {
  padding: 6px 10px;
  font-size: 13px;
  border: 2px solid transparent;
  border-radius: 6px;
  background-color: #f6faff;
  transition: border-color 0.2s;
}

select:focus {
  border-color: #4d8eff;
  outline: none;
}

button {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: rgb(0, 0, 0);
}

button:hover {
  filter: brightness(1.05);
}

td button:nth-child(1) {
  background-color: #40a9ff;
}
td button:nth-child(2) {
  background-color: #ff4d4f;
}
.assign-box {
  padding: 30px;
  max-width: 80%;
  margin: 40px auto;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  text-align: center;
}

.assign-box h2 {
  font-size: 22px;
  font-weight: 800;
  color: #3ca1ff;
  margin-bottom: 10px;
}

.assign-description {
  font-size: 15px;
  color: #555;
  margin-bottom: 20px;
}

.mode-selector {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.mode-btn {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.mode-btn.new {
  background-color: #3ca1ff;
}

.mode-btn.edit {
  background-color: #ffa940;
}

.mode-btn:hover {
  filter: brightness(1.1);
}

/* 🔹 카드 전체 스타일 */
.timetable-toggle-card {
  max-width: 87%;
  margin: 40px auto;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  overflow: hidden;
}


/* 🔹 상단 클릭 영역 */
.card-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background-color: #ffffff;
  border-bottom: 1px solid #dde8f3;
}

.card-header h2 {
  color: #3ca1ff;
  font-size: 20px;
  font-weight: 800;
  margin: 0;
}

.toggle-icon {
  font-size: 26px;
  color: #3ca1ff;
  transition: transform 0.2s ease;
}

/* 🔹 본문 확장 영역 */
.card-body {
  padding: 0px 0px;
  animation: fadeIn 0.3s ease;
}


/* 🔹 부드러운 transition 효과 */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  transform: scaleY(0.9);
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

/* 🔹 부드러운 나타남 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}


</style>
