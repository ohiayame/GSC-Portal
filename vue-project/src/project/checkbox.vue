<template>
  <header>
    <button @click="showPage('checkbox')">📅 checkbox</button>
    <button @click="showPage('edit')">✏️ count</button>
  </header>

  <div v-if="view === 'checkbox'">
    <h3 v-if="subjects.length === 0">⚠️ 등록된 값이 없습니다.</h3>
    <h3 v-else>📌 저장된 값:</h3>

    <p v-for="(subject, index) in subjects" :key="index">
      <input type="checkbox" v-model="subject.checked">
      {{ subject.text }}
    </p>

    <input type="text" v-model="text" placeholder="내용 입력">
    <button @click="addText">등록</button>
  </div>

  <div v-if="view === 'edit'">
    <h3>{{ count }}</h3>
    <button @click="count++">up</button>
    <button @click="count--">down</button>
  </div>
</template>

<script setup>
import { ref } from "vue"; 

const text = ref(""); 
const subjects = ref([]);  
const view = ref("checkbox");
const count = ref(0);

const addText = () => {
  if (text.value.trim()) { // 입력 값이 있으면면
    subjects.value.push({ text: text.value, checked: false }); 
    text.value = "";
  }
};

const showPage = (page) => {
  view.value = page;
};

</script>