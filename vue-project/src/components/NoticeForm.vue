<script setup>
import { ref, onMounted, computed } from "vue";
import { useNoticesStore } from "../stores/notices";
import { useRoute, useRouter } from "vue-router";
import { useTimetableStore } from "../stores/timetable";

const store = useNoticesStore();
const timetableStore = useTimetableStore();

const route = useRoute();
const router = useRouter();

const title = ref("");
const content = ref("");
const author_id = ref(1);
const target = ref(0);
const priority = ref("normal");
const selectedCourse = ref("과목 선택 없음");

// ✅ 수정 모드일 경우 기존 데이터 불러오기
onMounted(() => {
  timetableStore.fetchTimetables();
  if (route.params.id) {
    const notice = store.getNoticeById(route.params.id);
    if (notice) {
      title.value = notice.title;
      content.value = notice.content;
      author_id.value = notice.author_id;
      target.value = notice.target;
      selectedCourse.value = notice.course_id;
      priority.value = notice.priority;
    }
  }
});

const filteredCourses = computed(() => {
  if(target.value === 0){
    return;
  }
  // 전체(0) 선택 시 모든 과목 표시, 특정 학년 선택 시 해당 학년의 과목만 표시
  return timetableStore.timetables.filter(course => target.value === 0 || course.grade === target.value);
});


const saveNotice = async () => {
  if (!title.value.trim() || !content.value.trim()) {
    alert("제목과 내용을 입력하세요.");
    return;
  }

  const noticeData = {
    title: title.value,
    content: content.value,
    author_id: author_id.value,
    target: target.value,
    course_id: selectedCourse.value,
    priority: priority.value,
  };

  if (route.params.id) {
    // ✅ 수정 모드
    await store.updateNotice(route.params.id, noticeData);
  } else {
    // ✅ 새 공지 작성 모드
    await store.addNotice(noticeData);
  }

  router.push("/notices"); // ✅ 저장 후 목록으로 이동
};
</script>

<template>
  <div class="notice-form">
    <h2>{{ route.params.id ? "공지 수정" : "공지 작성" }}</h2>

    <label for="title">제목</label>
    <input id="title" v-model="title" placeholder="제목 입력" />

    <div class="row">
      <div class="field">
        <label for="target">대상 학년</label>
        <select id="target" v-model="target">
          <option :value="0">전체</option>
          <option :value="1">1학년</option>
          <option :value="2">2학년</option>
          <option :value="3">3학년</option>
        </select>
        <label for="priority">중요 공지 여부</label>
        <select id="priority" v-model="priority">
          <option value="normal">일반</option>
          <option value="pinned">중요 공지</option>
        </select>

      </div>



      <div class="field">
        <!-- 학년별 과목 -->
        <label for="course">과목 선택</label>
        <select id="course" v-model="selectedCourse">
          <option>과목 선택 없음</option>
          <option v-for="course in filteredCourses" :key="course.course_id" :value="course.course_id">
            {{ course.course_name }}
          </option>
        </select>
        <label for="file">파일 업로드</label>
        <input id="file" type="file" @change="handleFileUpload" accept="image/*, .pdf" />
      </div>
    </div>

    <label for="content">내용</label>
    <textarea id="content" v-model="content" placeholder="내용 입력"></textarea>

    <img v-if="previewImage" :src="previewImage" alt="이미지 미리보기" class="preview-img" />

    <div class="button-container">
      <button @click="router.push('/notices')" class="back">돌아가기</button>
      <button @click="saveNotice">{{ route.params.id ? "수정" : "등록" }}</button>
    </div>
  </div>
</template>


<style scoped>
.notice-form {
  width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.notice-form h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: bold;
}

label {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  font-weight: bold;
}

input, textarea, select {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

textarea {
  height: 300px; /* 내용 입력칸 크기 조정 */
  resize: vertical; /* 크기 조절 가능하도록 설정 */
}

.row {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.field {
  width: 48%; /* 필드 크기를 균등하게 나눔 */
}

.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: bold;
  background-color: #485ff7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button.back {
  background-color: #ccc;
  color: black;
}

button:hover {
  background-color: #5fb7ff;
}

button.back:hover {
  background-color: #b3b3b3;
}
</style>
