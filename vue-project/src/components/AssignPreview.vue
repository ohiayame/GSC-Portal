<template>
  <div class="preview-content">
    <h3>📋 현재 분반 현황</h3>

    <div v-for="group in displayGroups" :key="group.group_id" class="group-block">
      <h4>{{ group.subjectSummary }}</h4>

      <table class="styled-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>학년</th>
            <th>분반</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(student, idx) in group.students" :key="student.id">
            <td>{{ idx + 1 }}</td>
            <td>{{ student.name }}</td>
            <td>{{ student.grade }}</td>
            <td>{{ student.class_section !== null ? student.class_section + '반' : student.course_name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>



<script setup>
import { onMounted, computed } from 'vue'
import { useAssignLevelStore } from '@/stores/assignLevel';
const level = useAssignLevelStore();
const groups = computed(() => level.groups);
console.log("groups", groups)

const displayGroups = computed(() => {
  return groups.value.map(group => {
    // course_name + class_section 조합을 고유하게 정리
    const subjects = [...new Set(group.students.map(s => {
      if (s.class_section != null) {
        return `${s.course_name} (${s.class_section}반)`;
      } else {
        return s.course_name;
      }
    }))];

    return {
      ...group,
      subjectSummary: subjects.join(', ')
    };
  });
});

onMounted(async () => {
  await level.fetchAllGroupAssignments();
});

</script>

<style scoped>
.preview-content {
  padding: 24px;
  font-family: 'Pretendard', sans-serif;
}

.group-block {
  margin-bottom: 48px;
}

.course-block {
  margin-bottom: 32px;
}

h4 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #ccc;
}

.styled-table th,
.styled-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.styled-table thead {
  background-color: #e1ecfa;
}


</style>
