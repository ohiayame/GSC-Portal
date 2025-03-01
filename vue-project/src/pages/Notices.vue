<script setup>
import { onMounted } from "vue";
import { useNoticesStore } from "../stores/notices";

const store = useNoticesStore();

onMounted(() => {
  store.fetchNotices();
});
</script>

<template>
  <div>
    <h1>공지사항</h1>
    <button @click="$router.push('/notices/new')">새 공지 작성</button>

    <table border="1">
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>대상</th>
          <th>작성일</th>
          <!-- <th>관리</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(notice, index) in store.notices" :key="notice.id">
          <td>{{ index + 1 }}</td>
          <td>
            <router-link :to="'/notices/' + notice.id">
              {{ notice.title }}
            </router-link>
          </td>
          <td>{{ store.getTargetLabel(notice.target) }}</td>
          <td>{{ new Date(notice.created_at).toLocaleString() }}</td>
          <!-- <td>
            <button @click="store.deleteNotice(notice.id)">삭제</button>
          </td> -->
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
