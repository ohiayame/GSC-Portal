<template>
  <div class="register-container">
    <h2>회원 가입</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">이름</label>
        <input v-model="form.name" type="text" id="name" required />
      </div>

      <div class="form-group">
        <label for="student_id">학번</label>
        <input v-model="form.student_id" type="text" id="student_id" required />
      </div>

      <div class="form-group">
        <label for="grade">학년</label>
        <select v-model="form.grade" id="grade" required>
          <option value="1">1학년</option>
          <option value="2">2학년</option>
          <option value="3">3학년</option>
        </select>
      </div>

      <div class="form-group">
        <label for="email">이메일</label>
        <input v-model="form.email" type="email" id="email" required />
      </div>

      <div class="form-group">
        <label for="phone">전화번호</label>
        <input v-model="form.phone" type="tel" id="phone" required />
      </div>

      <div class="form-group">
        <label>유학생</label>
        <div class="radio-group">
          <label><input type="radio" v-model="form.international" value="yes" /> O</label>
          <label><input type="radio" v-model="form.international" value="no" /> X</label>
        </div>
      </div>

      <button type="submit">가입하기</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const params = new URLSearchParams(window.location.search);
const email = params.get("email") || "";
const name = params.get("name") || "";

console.log("📌 [DEBUG] URLSearchParams에서 가져온 email:", email);
console.log("📌 [DEBUG] URLSearchParams에서 가져온 name:", name);

// ✅ 초기값 설정
const form = ref({
  name: name || "",
  email: email || "",
  student_id : "",
  grade: "1",
  international: "no",
  phone: "",
});


const handleRegister = () => {
  console.log("가입 정보:", form.value);
  authStore.registerUser(form.value);
};
</script>

<style scoped>
.register-container {
  max-width: 380px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 15px;
  font-size: 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  width: 100%;
  text-align: left;
}

input, select {
  width: 95%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
}

.radio-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 5px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 5px;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background-color: #0056b3;
}
</style>
