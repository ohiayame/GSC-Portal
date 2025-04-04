<script setup>
import { computed, ref, onMounted } from "vue";
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
const codeRef = ref(null);
const copied = ref(false);

const course = timetableStore.timetables.find(course =>
  course.course_id === notice.course_id)?? {};

console.log("notice", notice)
// ✅ 날짜 변환 함수
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

// 작성자 이름 찾기
const author = computed(() =>
  auth.pendingUsers.find(user => user.id === notice.author_id)
);


const copyToClipboard = () => {
  if (!codeRef.value) return;

  navigator.clipboard.writeText(codeRef.value.textContent).then(() => {
    copied.value = true;
    setTimeout(() => copied.value = false, 3000); // ✅ 1.5초 뒤 복원
  });
};

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

onMounted(async () => {
  await auth.fetchPendingUsers();
});
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
          <td>{{ author ? author.name : "알 수 없음" }}</td>
          <td>{{ formatDate(notice.created_at) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="code-wrapper">
      <pre ref="codeRef" class="code-block">{{ notice.content }}</pre>

      <button class="copy-button" @click="copyToClipboard">
        <span v-if="copied">✔ 복사됨</span>
        <span v-else>📋 복사</span>
      </button>
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
  max-width: 800px;
  margin: 30px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

h2 {
  text-align: center;
  font-size: 26px;
  color: #3ca1ff;
  font-weight: 800;
  margin-bottom: 25px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

th,
td {
  padding: 12px;
  border: 1px solid #e0e6ed;
  text-align: center;
  font-size: 14px;
}

th {
  background-color: #e1ecfa;
  font-weight: 700;
  color: #2c3e50;
}

.content-box {
  background-color: #f8fbff;
  padding: 16px;
  border-radius: 10px;
  min-height: 100px;
  font-size: 15px;
  color: #333;
  border: 1.5px solid #e0e6ed;
  line-height: 1.6;
}

.notice-item {
  background: #f9fafe;
  border-radius: 10px;
  padding: 16px;
  border: 1.5px solid #e0e6ed;
  margin-top: 20px;
}

.preview-img {
  max-width: 100%;
  height: auto;
  margin-top: 12px;
  border-radius: 8px;
  border: 1px solid #d0d7de;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.file-name {
  margin: 10px 0;
  font-size: 14px;
  font-weight: 500;
}

a {
  color: #1e6eea;
  font-weight: 500;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
}

button {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}

button:hover {
  opacity: 0.9;
}

button.back {
  background-color: #ccc;
  color: black;
}

button.back:hover {
  background-color: #b3b3b3;
}

button:not(.back) {
  background-color: #3ca1ff;
  color: white;
}

button:not(.back):hover {
  background-color: #1d8fff;
}
.code-wrapper {
  position: relative;
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 20px;
  font-family: 'Courier New', monospace;
}

.code-block {
  white-space: pre-wrap;
  font-size: 14px;
  color: #24292f;
  line-height: 1.6;
}

.copy-button {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background-color: #e4edf7;
}

</style>
