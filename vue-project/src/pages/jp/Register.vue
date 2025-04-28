<template>
  <div class="page">
  <div class="register-form">
    <h2>会員登録</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">氏名</label>
        <input v-model="form.name" type="text" id="name" placeholder="氏名" required />
      </div>

      <div class="form-group">
        <label for="student_id">学籍番号</label>
        <input v-model="form.student_id" type="text" id="student_id" placeholder="学籍番号" required />
      </div>

      <div class="form-group">
        <label for="grade">学年</label>
        <select v-model="form.grade" id="grade" required>
          <option value="1">1年生</option>
          <option value="2">2年生</option>
          <option value="3">3年生</option>
        </select>
      </div>

      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input v-model="form.email" type="email" id="email" placeholder="example@g.yju.ac.kr" required />
      </div>

      <div class="form-group">
        <label for="phone">電話番号</label>
        <input v-model="form.phone" type="tel" id="phone" placeholder="電話番号" required />
      </div>

      <div class="form-group">
        <label>留学生</label>
        <div class="radio-group">
          <label><input type="radio" v-model="form.international" value="yes" /> O</label>
          <label><input type="radio" v-model="form.international" value="no" /> X</label>
        </div>
      </div>

      <button type="submit">登録</button>
    </form>
  </div>
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
.page {
  background: linear-gradient(135deg, #f0f5ff, #e8f0ff);
  height: 100vh;
}

.register-form {
  width: 500px;
  margin: 0 auto;
  margin-bottom: 150px;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.137);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.register-form h2 {
  text-align: center;
  font-size: 24px;
  font-weight: 800;
  color: #3ca1ff;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

label {
  font-weight: 600;
  /* margin-left: 10px; */
  margin-bottom: 6px;
  color: #333;
}

input,
select {
  padding: 10px;
  margin-left: 40px;
  border: 2px solid transparent;
  border-radius: 8px;
  background-color: #f6faff;
  font-size: 14px;
  transition: border-color 0.2s ease;
}
input:hover,
select:hover,
input:focus,
select:focus {
  border-color: #4d8eff;
  outline: none;
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 5px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #3ca1ff;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;
  box-shadow: 0 3px 10px rgba(60, 161, 255, 0.2);
}

button:hover {
  background-color: #1d8fff;
}

</style>
