<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h2>허용 이메일 추가</h2>
      <input v-model="newEmail" placeholder="example@gmail.com" />
      <div class="footer">
        <button @click="submit">추가</button>
        <button @click="emit('close')">닫기</button>
      </div>

      <hr style="margin: 16px 0;" />
      <h3>📋 등록된 이메일 목록</h3>
      <ul class="email-list">
        <li v-for="email in emailStore.emails" :key="email.email">
          {{ email.email }}
          <button class="delete-btn" @click="remove(email.email)">삭제</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAllowedEmailStore } from '@/stores/allowedEmails.js';

const emit = defineEmits(['close']);
const emailStore = useAllowedEmailStore();
const newEmail = ref('');

const submit = async () => {
  if (!newEmail.value.endsWith('@gmail.com')) {
    alert('⚠️ @gmail.com 도메인만 허용됩니다.');
    return;
  }
  try {
    await emailStore.addAllowedEmail(newEmail.value);
    alert("✅ 이메일 추가 완료!");
    newEmail.value = '';
  } catch (err) {
    alert("❌ 추가 실패: " + (err.response?.data?.error || "오류 발생"));
  }
};

const remove = async (email) => {
  if (confirm(`정말로 ${email} 을 삭제하시겠습니까?`)) {
    try {
      await emailStore.deleteAllowedEmail(email);
      alert("🗑️ 삭제 완료");
    } catch (err) {
      alert("❌ 삭제 실패: " + (err.response?.data?.error || "오류 발생"));
    }
  }
};

onMounted(() => {
  emailStore.fetchAllowedEmails();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 360px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
.email-list {
  margin-top: 8px;
  list-style: none;
  padding: 0;
}
.email-list li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.delete-btn {
  background-color: #ff4d4f;
  color: white;
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
}
</style>
