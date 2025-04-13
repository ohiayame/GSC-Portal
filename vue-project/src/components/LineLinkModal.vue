<template>
  <div class="modal" v-if="show">
    <div class="modal-content">
      <span class="close" @click="close">&times;</span>

      <button class="top-btn" @click="goToLine">LINE 연동하기</button>
      <h3 v-if="isAlready">이미 등록 되어있습니다.</h3>
      <div class="qr-box">
        <img
          class="qr"
          src="https://qr-official.line.me/gs/M_038yhjzg_GW.png?oat_content=qr"
          alt="LINE QR 코드"
        />
        <p>QR code로 GSC LINE 채널을 추가해주세요.</p>
      </div>

      <button class="issue-btn" @click="getCode">인증코드 발급</button>

      <div class="code-display" v-if="code">
        <button v-if="code" @click="copyCode" class="copy-btn">복사</button>
        <p>{{ code }}</p>
      </div>

      <button v-if="code" class="reissue-btn" @click="getCode">재발급</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const user = computed(() => auth.user);
const isAlready = ref(false);

if (user.value.line_id){
  isAlready.value = true;
};

const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(['close']);

const code = ref("");

function goToLine() {
  window.open("https://line.me/R/ti/p/@038yhjzg", "_blank");
}

function close() {
  emit('close');
}

function copyCode() {
  if (code.value) {
    navigator.clipboard.writeText(code.value);
    alert("📋 인증코드가 복사되었습니다.");
  }
}

async function getCode() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    alert("로그인 후 이용해주세요.");
    return;
  }

  const res = await fetch("http://localhost:3001/line/issue-code", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });

  if (!res.ok) {
    alert("코드 발급에 실패했습니다.");
    return;
  }

  const data = await res.json();
  code.value = data.code;
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 30px 20px;
  border-radius: 16px;
  text-align: center;
  width: 320px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.close {
  position: absolute;
  top: 10px;
  right: 16px;
  font-size: 30px;
  cursor: pointer;
}
.top-btn,
.issue-btn,
.reissue-btn {
  background-color: #00C300;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  width: 80%;
  cursor: pointer;
  transition: 0.2s;
}
.top-btn:hover,
.issue-btn:hover,
.reissue-btn:hover {
  background-color: #00a700;
}
.qr-box {
  margin: 20px 0;
}
.qr {
  width: 180px;
  height: 180px;
  margin-bottom: 8px;
}
.code-display {
  font-size: 25px;
  font-weight: bold;
  border: 2px solid black;
  border-radius: 8px;
  margin: 12px 0;
  background: #f4f4f4;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.code-text {
  margin: 0 auto;
  text-align: center;
}
.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  padding: 4px 8px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
}
.copy-btn:hover {
  background: #ddd;
}
</style>
