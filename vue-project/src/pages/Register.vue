<template>
  <div class="register-container">
    <h2>회원 가입</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">이름</label>
        <input v-model="form.name" type="text" id="name" required />
      </div>

      <div class="form-group">
        <label for="studentId">학번</label>
        <input v-model="form.studentId" type="text" id="studentId" required />
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
        <label>유학생</label>
        <div class="radio-group">
          <label><input type="radio" v-model="form.foreignStudent" value="O" /> O</label>
          <label><input type="radio" v-model="form.foreignStudent" value="X" /> X</label>
        </div>
      </div>

      <div class="form-group">
        <label for="phone">전화번호</label>
        <input v-model="form.phone" type="tel" id="phone" required />
      </div>

      <button type="submit">가입하기</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const form = ref({
  name: "",
  studentId: "",
  grade: "1",
  foreignStudent: "X",
  phone: "",
});

const handleRegister = () => {
  console.log("가입 정보:", form.value);
  alert("회원 가입이 완료되었습니다!");
};
</script>

<style scoped>
.register-container {
  max-width: 380px;
  margin: auto;
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
