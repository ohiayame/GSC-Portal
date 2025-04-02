<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAssignLevelStore } from '@/stores/assignLevel.js'
import ModalChooseCourse from "@/components/ModalChooseCourse.vue";

const router = useRouter();
const auth = useAuthStore();
const level= useAssignLevelStore();
const showModal = ref(false);


const goToAssignLevel = (mode) => {
  level.mode = mode
  router.push("/assignLevel");
}

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

onMounted(async () => {
  await auth.fetchPendingUsers(); // 전체 유저 목록 불러오기
  isLoading.value = false;
});
</script>


<template>
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
            <label for="role"></label>
            <select v-model="user.role" @change="updateRole(user.id, user.role)">
              <option value="학생">학생</option>
              <option value="교수">교수</option>
              <option value="관리자">관리자</option>
            </select>
          </td>
          <td><button  v-if="user.approved === 0" @click="approveUser(user.id)">✅ 승인</button></td>
          <td><button  v-if="user.approved === 0" @click="rejectUser(user.id)">❌ 거절</button></td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- AdminApproval.vue 내 -->
  <div class="assign-box">
    <h2>📚 분반 등록</h2>
    <p class="assign-description">
      학생들을 과목별로 분반에 등록하거나 수정할 수 있습니다.
    </p>
    <div class="mode-selector">
      <button @click="showModal = true" class="mode-btn new">➕ 신규 등록</button>


      <button @click="goToAssignLevel('edit')" class="mode-btn edit">✏️ 기존 수정</button>
    </div>
    <ModalChooseCourse v-if="showModal" @close="showModal = false" @confirm="handleCourseSelection" />
  </div>

</template>


<style scoped>
.approval-container {
  padding: 30px;
  max-width: 1000px;
  margin: 30px auto;
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
  max-width: 1000px;
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



</style>
