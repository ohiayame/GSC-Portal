<script setup>
import { ref, onMounted, computed } from "vue";
import { useTimetableStore } from "../stores/timetable";
import { useSpecialSessionStore } from "../stores/specialSessions";
import { useRouter } from "vue-router";

const store = useTimetableStore();
const specialStore = useSpecialSessionStore();
const router = useRouter();
const isLoading = ref(true);
const hidePastMakeups = ref(false); // 보강용
const hidePastCancels = ref(false); // 휴강용
const hidePastSchedules = ref(false);


const selectedGrade = ref("");
const sortOrder = ref("grade");

const props = defineProps({
  mode: {
    type: String,
    default: 'page', // 기본은 페이지 전체 뷰
  },
});

const filteredSortedTimetables = computed(() => {
  return store.timetables
    .filter(tt => {
      const matchGrade = !selectedGrade.value || tt.grade === Number(selectedGrade.value);
      const isPast = new Date(tt.end_date) < new Date().setHours(0, 0, 0, 0);
      const matchTime = !hidePastSchedules.value || !isPast;
      return matchGrade && matchTime;
    })
    .sort((a, b) => {
      if (sortOrder.value === "grade") {
        return a.grade - b.grade;
      }
      const dateA = new Date(a.end_date);
      const dateB = new Date(b.end_date);
      return sortOrder.value === "asc" ? dateA - dateB : dateB - dateA;
    });
});



// ✅ 페이지 로드시 시간표 데이터 불러오기
onMounted(async () => {
  await store.fetchTimetables();
  await specialStore.fetchSessions();
  isLoading.value = false;
});

const filteredMakeups = computed(() => {
  return specialStore.sessions.filter(session => {
    const isPast = new Date(session.date) < new Date().setHours(0, 0, 0, 0);
    return session.type === '보강' && (!hidePastMakeups.value || !isPast);
  });
});

const filteredCancels = computed(() => {
  return specialStore.sessions.filter(session => {
    const isPast = new Date(session.date) < new Date().setHours(0, 0, 0, 0);
    return session.type === '휴강' && (!hidePastCancels.value || !isPast);
  });
});




// ✅ 시간표 삭제 함수
const deleteTt = async (id) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  await store.deleteTimetable(id);
  console.log("📌 id값 :", id);
  alert("삭제 완료!");
};

const deleteSS = async (course_id) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  await specialStore.deleteSession(course_id);
  console.log("📌 id값 :", course_id);
  alert("삭제 완료!");
};

// ✅ 시간표 수정 페이지로 이동
const editTimetable = (timetable) => {
  console.log("📌 id값 :", timetable.course_id);
  router.push({
    path: `/timetable/edit/${timetable.course_id}`,
    query: {
      course_id: timetable.course_id,
      course_name: timetable.course_name,
      professor: timetable.professor,
      grade: timetable.grade,
      class_section: timetable.class_section,
      type: timetable.type,
      day: timetable.day,
      period: timetable.period,
      duration: timetable.duration,
      location: timetable.location,
      start_date: timetable.start_date.split("T")[0] ,
      end_date: timetable.end_date.split("T")[0] ,
    },
  });
};
</script>

<template>
  <div :class="[props.mode === 'modal' ? 'modal-container' : 'page']">
  <div :class="[props.mode === 'modal' ? 'modal-container' : 'manage-container']">
    <h2 v-if="props.mode !== 'modal'">시간표 관리</h2>
    <button  @click="$router.push('/timetable/new')" class="new-btn">새 시간표 등록</button>

    <div class="toolbar">
      <select v-model="selectedGrade">
        <option value="">전체 학년</option>
        <option value="1">1학년</option>
        <option value="2">2학년</option>
        <option value="3">3학년</option>
        <option value="4">유학생</option>
      </select>

      <select v-model="sortOrder">
        <option value="grade">학년순</option>
        <option value="desc">최신순</option>
        <option value="asc">오래된 순</option>
      </select>
    </div>

    <div class="filter-container">
      <input type="checkbox" v-model="hidePastSchedules" class="toggle-filter" />
      지난 수업 숨김
    </div>

    <div v-if="isLoading">⏳ 데이터 불러오는 중...</div>
    <div v-else-if="store.timetables.length === 0">📭 등록된 시간표가 없습니다.</div>

    <div v-else>
      <table  class="timetable">
        <thead>
          <tr>
            <th>학년</th>
            <th>과목명</th>
            <th>교수명</th>
            <th>요일</th>
            <th>교시</th>
            <th>강의실</th>
            <th>기간</th>
            <th>수정</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="timetable in filteredSortedTimetables" :key="timetable.id">
            <td>{{ timetable.grade }}</td>
            <td>{{ timetable.course_name }}</td>
            <td>{{ timetable.professor }}</td>
            <td>{{ timetable.day }}</td>
            <td>{{ timetable.period }}교시
              <span>({{ timetable.duration }}시간)</span></td>
            <td>{{ timetable.location }}</td>
            <td>{{ timetable.start_date.split("T")[0] }} ~ <br>{{ timetable.end_date.split("T")[0] }}</td>
            <td><button class="edit-btn" @click="editTimetable(timetable)">✏️ 수정</button></td>
            <td><button class="delete-btn" @click="deleteTt(timetable.id)">🗑 삭제</button></td>
          </tr>
        </tbody>
      </table>

      <h3>❌ 휴강 정보</h3>
      <!-- ✅ 휴강 필터 -->
      <div class="filter-container">
        <input type="checkbox" @click="hidePastCancels = !hidePastCancels" class="toggle-filter">
        지난 휴강 숨김
      </div>

      <table class="timetable">
        <thead>
          <tr>
            <th>학년</th>
            <th>과목명</th>
            <th>교수명</th>
            <th>날짜</th>
            <th>교시</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in filteredCancels" :key="session.id">
            <td>{{ store.timetables.find(cls => cls.course_id === session.course_id)?.grade }}</td>
            <td>
              {{ store.timetables.find(cls => cls.course_id === session.course_id)?.course_name || "수업 정보 없음" }}
            </td>
            <td>
              {{ store.timetables.find(cls => cls.course_id === session.course_id)?.professor || "정보 없음" }}
            </td>
            <td>{{ session.date }}</td>
            <td>{{ session.start_period }}교시 <span>({{ session.duration }}시간)</span></td>
            <td><button class="delete-btn" @click="deleteSS(session.id)">🗑 삭제</button></td>
          </tr>
        </tbody>
      </table>

      <!-- ✅ 보강 테이블 -->
      <h3>🔄 보강 정보</h3>
      <button  @click="$router.push({ path: '/timetable/special', query: { type: '보강' } })" class="new-btn">보강 등록</button>
      <div class="filter-container">
        <input type="checkbox" @click="hidePastMakeups  = !hidePastMakeups " class="toggle-filter">
        지난 보강 숨김
      </div>
      <table class="timetable">
        <thead>
          <tr>
            <th>학년</th>
            <th>과목명</th>
            <th>교수명</th>
            <th>날짜</th>
            <th>교시</th>
            <th>강의실</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in filteredMakeups" :key="session.id">
            <td>{{ store.timetables.find(cls => cls.course_id === session.course_id)?.grade }}</td>
            <td>
              {{ store.timetables.find(cls => cls.course_id === session.course_id)?.course_name || "수업 정보 없음" }}
            </td>
            <td>
              {{ store.timetables.find(cls => cls.course_id === session.course_id)?.professor || "정보 없음" }}
            </td>
            <td>{{ session.date }}</td>
            <td>{{ session.start_period }}교시 <span>({{ session.duration }}시간)</span></td>
            <td>{{ session.location || "-" }}</td>
            <td><button class="delete-btn" @click="deleteSS(session.id)">🗑 삭제</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="props.mode !== 'modal'" class="bottom-button-container">
      <button @click="router.push('/timetable')" class="back">돌아가기</button>
    </div>
  </div>
</div>
</template>

<style scoped>
.page {
  background: linear-gradient(135deg, #f0f5ff, #e8f0ff);
  height: auto;
  padding-top: 40px;
}

.manage-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.manage-container h2 {
  text-align: center;
  color: #3ca1ff;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 16px;
}
.modal-container{
  margin: 40px 40px 0px 40px;
}

.toolbar {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin: 16px 0;
}

.toolbar select {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 6px;
  border: 1.5px solid #cdd8e3;
  background-color: #f9fbff;
  color: #333;
  transition: border-color 0.2s ease;
}

.toolbar select:focus {
  outline: none;
  border-color: #3ca1ff;
}


.timetable {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
  margin-bottom: 40px;
  background-color: #fafcff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

th, td {
  padding: 12px 10px;
  border: 1px solid #e0e6ed;
  text-align: center;
  color: #333;
}

th {
  background-color: #e1ecfa;
  font-weight: 700;
}

h3 {
  margin-top: 50px;
  font-size: 18px;
  font-weight: 700;
  color: #444;
  text-align: left;
  margin-bottom: 10px;
}

/* 🔹 필터 영역 */
.filter-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 14px;
}

/* 체크박스 */
.toggle-filter {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #3ca1ff;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.toggle-filter:checked {
  background-color: #3ca1ff;
  border-color: #3ca1ff;
}

.toggle-filter:checked::after {
  content: "✔";
  font-size: 13px;
  color: white;
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
}

/* 🔹 버튼 영역 */
.new-btn {
  float: right;
  margin-bottom: 12px;
  padding: 10px 16px;
  background-color: #3ca1ff;
  color: white;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-btn:hover {
  background-color: #1d8fff;
}

/* 수정, 삭제 버튼 */
.edit-btn, .delete-btn {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.edit-btn {
  background-color: #ffd966;
  color: #333;
}

.edit-btn:hover {
  background-color: #ffc107;
}

.delete-btn {
  background-color: #ff7369;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 돌아가기 버튼 */
.bottom-button-container {
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
}

.back {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 8px;
  background-color: #ccc;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
}

.back:hover {
  background-color: #b1b1b1;
}

</style>
