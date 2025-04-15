<script setup>
import { onMounted, computed } from "vue";
import { useAssignLevelStore } from "@/stores/assignLevel";

const assignStore = useAssignLevelStore();
const emit = defineEmits(["confirm", "close"]);
const chooseGroups = computed(() => assignStore.chooseGroups);

onMounted(() => {
  assignStore.fetchGroupList(); // ✅ 그룹 리스트 불러오기
});

function confirmSelection() {
  if (assignStore.selectedGroupId) {
    emit("confirm", assignStore.selectedGroupId);
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>📋 분반 수정 선택</h2>
      <ul class="group-list">
        <li
          v-for="group in chooseGroups"
          :key="group.group_id"
          class="group-item"
        >
          <label class="group-card">
            <input
              type="radio"
              :value="group.group_id"
              v-model="assignStore.selectedGroupId"
            />
            <div class="group-text">
              <div class="group-title">Group {{ group.group_id }}</div>
              <div class="subject-names">
                {{ group.courses
                  .map(c => c.class_section != null
                    ? `${c.course_name} (${c.class_section}반)`
                    : `${c.course_name}`
                  )
                  .join(', ')
                }}
              </div>
            </div>
          </label>
        </li>
      </ul>

      <div class="modal-buttons">
        <button @click="confirmSelection" :disabled="!assignStore.selectedGroupId">확인</button>
        <button @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.modal-content h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #ff9800;
  text-align: center;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  margin: 0 0 20px 0;
}

.group-item {
  list-style: none;
}

.group-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px 20px;
  background-color: #fff5e9;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.group-card:hover {
  background-color: #fff0da;
}

.group-card input[type="radio"] {
  margin-top: 4px;
  accent-color: #ff9800;
}

.group-text {
  display: flex;
  flex-direction: column;
}

.group-title {
  font-size: 16px;
  font-weight: bold;
  color: #222;
  margin-bottom: 6px;
  text-align: left;
  display: block;
}

.subject-names {
  font-size: 14px;
  color: #5c5c5c;
  letter-spacing: 0.5px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.modal-buttons button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.modal-buttons button:first-child {
  background-color: #3ca1ff;
  color: white;
}

.modal-buttons button:last-child {
  background-color: #f0f0f0;
}
</style>
