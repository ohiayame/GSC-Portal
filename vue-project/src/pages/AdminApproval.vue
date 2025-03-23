<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

// 🔹 전체 유저 목록에서 승인 대기자만 필터링
// const pendingUsers = computed(() =>
//   auth.pendingUsers.filter(user => user.approved === 0)
// );

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

onMounted(async () => {
  await auth.fetchPendingUsers(); // 전체 유저 목록 불러오기
  isLoading.value = false;
});
</script>


<template>
  <div class="approval-container">
    <h2>👥 가입 승인 대기 목록</h2>
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
          <th>이름</th>
          <th>이메일</th>
          <th>학번</th>
          <th>학년</th>
          <th>전화번호</th>
          <th>유학생 여부</th>
          <th>승인</th>
          <th>거절</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.student_id || "-" }}</td>
          <td>{{ user.grade || "-" }}</td>
          <td>{{ user.phone || "-" }}</td>
          <td>{{ user.international }}</td>
          <td><button  v-if="user.approved === 0" @click="approveUser(user.id)">✅ 승인</button></td>
          <td><button  v-if="user.approved === 0" @click="rejectUser(user.id)">❌ 거절</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.approval-container {
  padding: 30px;
  max-width: 900px;
  margin: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
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

button {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}
</style>
