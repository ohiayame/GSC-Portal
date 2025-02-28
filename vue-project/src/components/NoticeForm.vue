<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps(["id"]);
const router = useRouter();
const isEditing = props.id !== undefined;

const title = ref("");
const content = ref("");
const author_id = ref(1);
const target = ref(0);
const priority = ref("normal");

if (isEditing) {
  fetch(`http://localhost:3001/api/notices/${props.id}`)
    .then(res => res.json())
    .then(data => {
      title.value = data.title;
      content.value = data.content;
    });
}

const saveNotice = async () => {
  if (!title.value || !content.value) {
    console.error("🚨 제목과 내용을 입력해야 합니다.");
    return;
  }

  const method = isEditing ? "PUT" : "POST";
  const url = isEditing ? `http://localhost:3001/api/notices/${props.id}` : "http://localhost:3001/api/notices";
  const body = JSON.stringify({
    title: title.value,
    content: content.value,
    author_id: author_id.value,
    target: target.value,
    priority: priority.value
  });
  console.log("📌 요청 데이터:", body);

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body
    });

    if (!response.ok) throw new Error("공지사항 저장 실패");

    router.push("/notices"); // ✅ 저장 후 목록으로 이동
  } catch (error) {
    console.error("🚨 공지사항 저장 중 오류:", error);
  }
};
</script>

<template>
  <div>
    <h2>{{ isEditing ? "공지 수정" : "공지 작성" }}</h2>
    <input v-model="title" placeholder="제목 입력" />
    <textarea v-model="content" placeholder="내용 입력"></textarea>
    <button @click="saveNotice">{{ isEditing ? "수정" : "등록" }}</button>
  </div>
</template>
