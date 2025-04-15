<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAssignLevelStore } from '@/stores/assignLevel.js'
import { useAllowedEmailStore } from '@/stores/allowedEmails';
import ModalChooseCourse from "@/components/ModalChooseCourse.vue";
import ModalChooseGroup from "@/components/ModalChooseGroup.vue";
import TimetableManage from "@/components/TimetableManage.vue";
import AllowedEmails from "@/components/AllowedEmails.vue";
import AssignPreview from "@/components/AssignPreview.vue";

const router = useRouter();
const auth = useAuthStore();
const level= useAssignLevelStore();

const showModal = ref(false);
const showGroupModal = ref(false);
const showTimetableModal = ref(false);
const showAssignPreview = ref(false);

const emailStore = useAllowedEmailStore();
const showEmailModal = ref(false);

const academicYear = ref(null);
const lastUpdated = ref(null);

// 🔹 승인 및 거절 버튼 액션
const approveUser = (id) => auth.approveUser(id);
const rejectUser = (id) => {
  if (confirm("정말로 이 회원을 삭제하시겠습니까?")) {
    auth.rejectUser(id);
  }
};

const isLoading = ref(true);
const showOnlyPending = ref(true); // ✅ true면 승인 대기자만, false면 전체
const onlyActive = ref(false);

const filteredUsers = computed(() => {
  let users = auth.pendingUsers;
  if (showOnlyPending.value) {
    users = users.filter(user => user.approved === 0);
  } else if (onlyActive.value) {
    users = users.filter(user => user.approved === 1 && user.status === 'active');
  }

  return users;
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

async function promoteGrades() {
  const confirmMsg = confirm("정말 전체 재학생의 학년을 1씩 올리시겠습니까?");
  if (!confirmMsg) return;

  const res = await fetch("http://localhost:3001/auth/promote-grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  const data = await res.json();
  alert(data.message || "학년 승급 완료");
}

const markAsLeave = async (id) => {
  const confirmLeave = confirm("이 학생을 휴학 처리하시겠습니까?");
  if (!confirmLeave) return;

  try {
    const res = await fetch(`http://localhost:3001/auth/leave/${id}`, {
      method: "PUT"
    });
    const data = await res.json();
    alert(data.message);
    await auth.fetchPendingUsers(); // 목록 새로고침
  } catch (err) {
    alert("❌ 휴학 처리 실패");
    console.error(err);
  }
};
const markAsReturn = async (id) => {
  const confirmReturn = confirm("이 학생을 복학 처리하시겠습니까?");
  if (!confirmReturn) return;

  try {
    const res = await fetch(`http://localhost:3001/auth/return/${id}`, {
      method: "PUT"
    });
    const data = await res.json();
    alert(data.message);
    await auth.fetchPendingUsers(); // 목록 새로고침
  } catch (err) {
    alert("❌ 복학 처리 실패");
    console.error(err);
  }
};



onMounted(async () => {
  const res = await fetch("http://localhost:3001/auth/latest-promotion");
  const data = await res.json();
  console.log("data", data)
  academicYear.value = new Date(data.year).getFullYear();
  lastUpdated.value = new Date().toLocaleString();

  await auth.fetchPendingUsers(); // 전체 유저 목록 불러오기
  isLoading.value = false;
  emailStore.fetchAllowedEmails();
});
</script>


<template>
  <div class="timetable-container">
    <h1>Management Page</h1>

    <!-- 기존 승인 대기 목록 -->
    <div class="approval-container">

        <h2>회원 목록</h2>
        <div class="promotion-header">

          <div class="row">
            <span class="title">🎓{{ academicYear }}년도</span>
            <button @click="showEmailModal = true" class="addEmail">+ 허용 이메일 추가</button>
          </div>

          <div class="row">
            <div class="filter-group">
              <label class="pending-filter">
              <input type="checkbox" v-model="showOnlyPending" />
              승인 대기자만 보기
              </label>
              <label class="pending-filter">
                <input type="checkbox" v-model="onlyActive" />
                재학생만 보기
              </label>
            </div>
            <div class="right-actions">
              <button @click="promoteGrades" class="promote-btn">학년 승급</button>
              <span class="updated-time">🕓 {{ lastUpdated }}</span>
            </div>
          </div>
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
            <th>유학생</th>
            <th>권한</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in filteredUsers" :key="user.id">
            <td>{{ index+1 }}</td>
            <td>{{ user.name }}</td>
            <td class="ellipsis">{{ user.email }}</td>
            <td>{{ user.student_id || "-" }}</td>
            <td>{{ user.grade || "-" }}</td>
            <td class="ellipsis">{{ user.phone || "-" }}</td>
            <td>{{ user.international }}</td>
            <td>
              <select v-model="user.role" @change="updateRole(user.id, user.role)">
                <option value="학생">학생</option>
                <option value="교수">교수</option>
                <option value="관리자">관리자</option>
              </select>
            </td>
            <td>
              <button v-if="user.approved === 0" @click="approveUser(user.id)" class="btn-approve">승인</button>
              <button v-else-if="user.status == 'active'" @click="markAsLeave(user.id)" class="btn-leave">휴학</button>
              <button v-else-if="user.status == 'leave'" @click="markAsReturn(user.id)" class="btn-return">복학</button>
            </td>
            <td>
              <button v-if="user.approved === 0" @click="rejectUser(user.id)" class="btn-reject">❌ 거절</button>
              <button v-else @click="rejectUser(user.id)" class="btn-delete">❌ 삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <AllowedEmails v-if="showEmailModal" @close="showEmailModal = false" />

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

      <div class="card-header" @click="showAssignPreview = !showAssignPreview">
        <h2>📘 분반 확인</h2>
        <span class="toggle-icon">{{ showAssignPreview  ? '∧' : '∨' }}</span>
      </div>
      <transition name="expand">
        <div v-if="showAssignPreview" class="card-body">
          <AssignPreview mode="modal" />
        </div>
      </transition>

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

.promotion-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.pending-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  white-space: nowrap;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.updated-time {
  font-size: 13px;
  color: #666;
  margin-top: 2px;
}


.addEmail {
  background-color: #3ca1ff;
  color: #e8f0ff;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.addEmail:hover {
  background-color: #51a5ff;
}

.promote-btn {
  background-color: #00b894;
  color: white;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.promote-btn:hover {
  background-color: #00a17a;
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
.ellipsis{
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
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
.btn-approve {
  background-color: #c9e4ff; /* 밝은 파랑 */
  color: rgb(25, 51, 99);
}
.btn-leave {
  background-color: #eed0ff; /* 연한 노랑 */
  color: #444;
}
.btn-return {
  background-color: #fffcd1; /* 연한 민트 */
  color: rgb(70, 69, 12);
}
.btn-reject {
  background-color: #ffd1e1; /* 진한 빨강 */
  color: rgb(196, 18, 18);
}
.btn-delete {
  background-color: #ff9e9e; /* 연한 주황/빨강 */
  color: rgb(255, 255, 255);
}

button:hover {
  filter: brightness(1.05);
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
