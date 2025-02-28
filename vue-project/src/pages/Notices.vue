<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const notices = ref([]);

const fetchNotices = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/notices");
    notices.value = await response.json();
  } catch (error) {
    console.error("공지사항을 불러오는 데 실패했습니다.", error);
  }
};

onMounted(fetchNotices);
</script>

<template>
  <div>
    <h1>공지사항</h1>
    <button @click="router.push('/notices/new')">새 공지 작성</button> <!-- 공지 작성 버튼 -->

    <ul>
      <li v-for="notice in notices" :key="notice.id">
        <router-link :to="'/notices/' + notice.id">
          {{ notice.title }}
        </router-link>
      </li>
    </ul>
  </div>
</template>
