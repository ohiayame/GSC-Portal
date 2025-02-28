<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted  } from "vue";



const route = useRoute();
const router = useRouter();
const notice = ref(null);

const fetchNotice = async () => {
  const id = route.params.id;
  if (!id) {
    console.error("🚨 공지사항 ID가 없습니다.");
    router.push("/notices"); // ID가 없으면 목록으로 이동
    return;
  }
  try {
    const response = await fetch(`http://localhost:3001/api/notices/${id}`);
    if (!response.ok) throw new Error("공지사항을 찾을 수 없습니다.");
    notice.value = await response.json();
  } catch (error) {
    console.error("공지사항 불러오기 실패:", error);
    router.push("/notices");
  }
};

const deleteNotice = async () => {
  const id = route.params.id;
  try {
    await fetch(`http://localhost:3001/api/notices/${id}`, { method: "DELETE" });
    router.push("/notices"); // 삭제 후 목록으로 이동
  } catch (error) {
    console.error("공지사항 삭제 실패:", error);
  }
};

onMounted(fetchNotice);
</script>

<template>
  <div v-if="notice">
    <h2>{{ notice.title }}</h2>
    <p>{{ notice.content }}</p>
    <button @click="router.push(`/notices/edit/${notice.id}`)">수정</button>
    <button @click="deleteNotice">삭제</button>
  </div>
</template>
