<script setup>
import { onMounted } from "vue";
import { useAssignLevelStore } from "@/stores/assignLevel";

const assignStore = useAssignLevelStore();
const emit = defineEmits(["confirm", "close"]);

onMounted(() => {
  assignStore.fetchGroupList(); // ✅ 스토어에서 호출
});

function confirmSelection() {
  if (assignStore.selectedGroupId) {
    emit("confirm", assignStore.selectedGroupId);
  }
}
</script>

<template>
  <div class="modal">
    <h2>📋 분반 수정 선택</h2>
    <ul>
      <li
        v-for="group in assignStore.groups"
        :key="group.group_id"
        class="group-item"
      >
        <label>
          <input
            type="radio"
            :value="group.group_id"
            v-model="assignStore.selectedGroupId"
          />
          <strong>Group {{ group.group_id }}</strong> :
          <span v-for="course in group.courses" :key="course.course_name">
            {{ course.course_name }}({{ course.class_section }}반)
          </span>
        </label>
      </li>
    </ul>
    <div class="modal-buttons">
      <button @click="confirmSelection" :disabled="!assignStore.selectedGroupId">확인</button>
      <button @click="$emit('close')">닫기</button>
    </div>
  </div>
</template>
