<script setup>
import { defineProps, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNoticesStore } from "../stores/notices";
import { useTimetableStore } from "../stores/timetable";
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
const user = computed(() => auth.user);

const route = useRoute();
const router = useRouter();
const store = useNoticesStore();

const notice = store.getNoticeById(route.params.id);
const timetableStore = useTimetableStore();


const course = timetableStore.timetables.find(course =>
  course.course_id === notice.course_id)?? {};


// ✅ 날짜 변환 함수
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

// const props = defineProps({
//   notice: Object, // ✅ 공지 객체 전달받기
// });

// ✅ 파일 유형이 이미지인지 확인하는 함수
const isImage = (fileUrl) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
};


const getFileName = (fileUrl) => {
  const fileName = fileUrl.split("/").pop(); // 파일명 추출
  return fileName.replace(/^\d+_/, "");  // ✅ 마지막 '/' 이후의 문자열 반환
};

// ✅ 수정 버튼 클릭 시 편집 페이지로 이동
const editNotice = () => {
  router.push(`/notices/edit/${route.params.id}`);
};

// ✅ 삭제 기능 추가
const deleteNotice = async () => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  await store.deleteNotice(route.params.id);
  router.push("/notices");
};
</script>

<template>
  <div class="notice-container" v-if="notice">
    <h2>{{ notice.title }}</h2>

    <table>
      <thead>
        <tr>
          <th>대상</th>
          <th>과목</th>
          <th>작성자</th>
          <th>작성일</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ store.getTargetLabel(notice.target) }}</td>
          <td>{{ course.course_name }}</td>
          <td>/</td>
          <td>{{ formatDate(notice.created_at) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="content-box">
      <p>{{ notice.content }}</p>
    </div>

    <!-- ✅ 파일이 있으면 파일 이름 출력 -->
    <div v-if="notice.file_url" class="notice-item">
      <h4>📎 첨부 파일</h4>
      <div v-if="isImage(notice.file_url)">
        <img :src="store.getFileUrl(notice.file_url)" alt="첨부 이미지" class="preview-img" />
      </div>
      <div v-else>
        <p class="file-name">파일 이름: {{ getFileName(notice.file_url) }}</p>
        <a :href="store.getFileUrl(notice.file_url)" target="_blank" download>📥 다운로드</a>
      </div>
    </div>

    <div class="button-container">
      <button @click="router.push('/notices')" class="back">돌아가기</button>
      <button v-if="user?.role !== '학생'" @click="editNotice">수정</button>
      <button @click="deleteNotice">삭제</button>
    </div>
  </div>
  <p v-else>공지사항을 불러오는 중...</p>
</template>


<style scoped>
.notice-container {
  width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #b0c4de;
  font-weight: bold;
}

.content-box {
  background: white;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  min-height: 80px; /* ✅ 내용 박스를 최소 크기로 조정 */
}

.notice-item {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.preview-img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

button {
  padding: 8px 12px;
  font-size: 14px;
  background-color: #485ff7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #5fb7ff;
}
button.back {
  background-color: #ccc;
  color: black;
}
button.back:hover {
  background-color: #b3b3b3;
}
</style>
