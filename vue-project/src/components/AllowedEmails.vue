<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <button @click="emit('close')" class="close-btn">×</button>
      <h2>허용 이메일 추가</h2>
      <label for="newEmail">Email</label>
      <input v-model="newEmail" placeholder="example@gmail.com" /><br>
      <label for="newMemo">Memo</label>
      <input v-model="newMemo" placeholder="예: 교수님 외부메일" />
      <div class="footer">
        <button @click="submit" class="add-btn">추가</button>
      </div>

      <hr style="margin: 16px 0;" />
      <h3>📋 등록된 이메일 목록</h3>
      <ul class="email-list">
        <li v-for="email in emailStore.emails" :key="email.email">
          <div class="email-info">
            {{ email.email }}
            <span class="memo-box">{{ email.memo }}</span>
          </div>
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
const newMemo = ref('');

const submit = async () => {
  if (!newEmail.value.endsWith('@gmail.com')) {
    alert('⚠️ @gmail.com 도메인만 허용됩니다.');
    return;
  }
  try {
    await emailStore.addAllowedEmail(newEmail.value, newMemo.value,);
    alert("✅ 이메일 추가 완료!");
    newEmail.value = '';
    newMemo.value = '';
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
  position: relative;
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 360px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
label {
    text-align: left; /* 텍스트를 왼쪽 정렬 */
    font-size: 14px;
    display: block; /* 블록 요소로 변경하여 줄바꿈 효과 적용 */
    font-weight: bold; /* 글자 굵게 */
    color: #444; /* 글자 색상을 어두운 회색으로 설정 */
}
input{
    width: 70%;
    padding: 5px 10px;
    background-color: #84c1fa32;
    border: 2px solid transparent;
    margin: 2px 0px 10px 15px;
    border-radius: 10px;
}:hover{
    border-color: #69b7db;
    outline: none;
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
.email-info {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memo-box {
  background-color: #e6f1ff;
  color: #333;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
}

.add-btn {
  background-color: #2d8cff;
  color: white;
  font-weight: 600;
  border: none;
  padding: 8px 36px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #1572e8;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 30px;
  color: #888;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #000;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s ease;
}
.delete-btn:hover {
  background-color: #9c0000;
}
</style>
