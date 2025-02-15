<template>

  <h3 v-if="subjects.length === 0">⚠️ 등록된 값이 없습니다.</h3>
  <h3 v-else>📌 저장된 값:</h3>

  <p v-for="(subject, index) in subjects" :key="index">
    <input type="checkbox" v-model="subject.checked"  @change="saveToLocalStorage">
    {{ subject.text }}
  </p>

  <input type="text" v-model="text" placeholder="내용 입력">
  <button @click="addText">등록</button>

</template>

<script setup>
import { ref, onMounted  } from "vue"; 

const text = ref(""); 
const subjects = ref([]);  

// 🔹 LocalStorage에서 데이터를 불러오는 함수
const loadFromLocalStorage = () => {
  const savedSubjects = localStorage.getItem("subjects");
  if (savedSubjects) {
    subjects.value = JSON.parse(savedSubjects);
  }
};

// 🔹 LocalStorage에 데이터를 저장하는 함수
const saveToLocalStorage = () => {
  localStorage.setItem("subjects", JSON.stringify(subjects.value));
};

const addText = () => {
  if (text.value.trim()) { // 입력 값이 있으면면
    subjects.value.push({ text: text.value, checked: false }); 
    saveToLocalStorage();
    text.value = "";
  }
};
onMounted(loadFromLocalStorage);
</script>