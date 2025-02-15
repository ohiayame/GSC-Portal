<script setup>
import { useDataStore } from '../stores/data';
import { ref } from "vue";

const store = useDataStore();

const text = ref("");
const isEdit = ref(false);
const editingIndex = ref(null); 
const editText = ref(""); 

// 추가
const addText = () => {
  if (text.value.trim()) {
    store.addSubject(text.value);
    text.value = "";
  }
};

// 삭제
const deleteItem = (index) => {
  store.removeSubject(index);
};

const clickEdit = () =>{
  isEdit.value = !isEdit.value;
  editText.value = "";
}

// 수정 항목 
const startEdit = (index, currentText) => {
  editingIndex.value = index;
  editText.value = currentText;
};

// 수정 
const saveEdit = (index) => {
  store.editSubject(index, editText.value);
  editingIndex.value = null; // 수정 모드 종료
  isEdit.value = !isEdit.value;
};
</script>

<template>
  <h3 v-if="store.subjects.length === 0">⚠️ 등록된 값이 없습니다.</h3>
  <h3 v-else>📌 저장된 값:</h3>

  <ul>
  <!-- 등록되어 있는 항목 출력력 -->
    <p v-for="(subject, index) in store.subjects" :key="index">
        <!-- 클릭 입력 -->
        <input  v-if="!isEdit" type="checkbox" v-model="subject.checked"> <!-- 수정 중이 아닐 때 -->
        <input v-else type="radio" name="selectEdit" @click="startEdit(index, subject.text)"><!-- 수정 중 (하나만 선택)-->
        
        <!-- checked면 취소선 -->
        <span :style="{ textDecoration: subject.checked ? 'line-through' : 'none' }"> 
          {{ subject.text }}
        </span>
        <button @click="deleteItem(index)">삭제</button>
    </p>
  </ul>

  <!-- 입력 -->
  <input type="text" v-model="text" placeholder="내용 입력">
  <button @click="addText">등록</button>
  <br>
  <br>
  <!-- 수정 기능 활성화 -->
  <button v-if="!isEdit && store.subjects.length" @click="clickEdit">✏️ 수정</button>
  <!-- 수정 -->
  <div v-else-if="isEdit">
    <input type="text" v-model="editText" placeholder="수정항목 선택">
    <button :disabled="!editingIndex" @click="saveEdit(editingIndex)">✅ 저장</button>
    <button @click="clickEdit">❌ 취소</button>
  </div>

</template>
