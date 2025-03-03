<template>
  <div class="special-session-container">
    <h2>{{ form.type }} 등록</h2>
    <form @submit.prevent="submitForm">

      <!-- ✅ 과목명 -->
      <div class="form-group">
        <label>과목명:</label>
        <input type="text" v-model="form.name" class="input-field" :disabled="form.type !== '보강'" />
      </div>

      <!-- ✅ 날짜 -->
      <div class="form-group">
        <label>날짜:</label>
        <input type="date" v-model="form.date" class="input-field" />
      </div>

      <!-- ✅ 구분 (휴강/보강) -->
      <div class="form-group">
        <label>구분:</label>
        <select v-model="form.type" class="input-field">
          <option value="휴강">휴강</option>
          <option value="보강">보강</option>
        </select>
      </div>

      <!-- ✅ 보강 선택 시 추가 입력 필드 -->
      <div v-if="form.type === '보강'">
        <div class="inline-group">
          <div class="form-group">
            <label>시작 교시:</label>
            <input type="number" v-model="form.start_period" class="input-field" />
          </div>

          <div class="form-group">
            <label>지속 시간:</label>
            <input type="number" v-model="form.duration" class="input-field" />
          </div>
        </div>

        <div class="form-group">
          <label>강의실:</label>
          <input type="text" v-model="form.location" class="input-field" />
        </div>
      </div>

      <!-- ✅ 버튼 -->
      <div class="button-container">
        <button type="button" class="back" @click="$router.push('/timetable')">돌아가기</button>
        <button type="submit" class="register">등록</button>
      </div>

    </form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSpecialSessionStore } from "../stores/specialSessions";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const specialSessionStore = useSpecialSessionStore();

    const form = ref({
      course_id: null,
      name: "",
      date: "",
      type: "보강",
      start_period: null,
      duration: null,
      location: "",
    });

    // ✅ 페이지 진입 시 query에서 데이터 가져와서 기본값 설정
    onMounted(() => {
      const { course_id, name, day, start_period, type } = route.query;
      if (course_id) {
        form.value.course_id = course_id;
        form.value.name = name;
        form.value.start_period = start_period;
        form.value.type = type || "보강"; // 기본값 설정
        form.value.date = getDefaultDate(day);
      }
    });

    // ✅ 날짜 기본값을 이번 주 해당 요일로 설정
    const getDefaultDate = (day) => {
      if (!day) return "";
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0(일)~6(토)
      const daysToAdd = { 월: 1, 화: 2, 수: 3, 목: 4, 금: 5 }[day] - dayOfWeek;
      today.setDate(today.getDate() + daysToAdd);
      return today.toISOString().split("T")[0]; // YYYY-MM-DD 포맷
    };

    // ✅ 등록 버튼 클릭 시 API 호출
    const submitForm = async () => {
      try {
        console.log("🚀 등록 요청 데이터:", form.value); // ✅ 요청 데이터 확인

        await specialSessionStore.addSession(form.value);

        alert("등록 완료!");
        router.push("/timetable");
      } catch (error) {
        console.error("❌ 등록 실패!", error);
        alert("등록 실패!");
      }
    };


    return {
      form,
      submitForm,
    };
  },
};
</script>

<style scoped>
.special-session-container {
  width: 500px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.special-session-container h2 {
  text-align: center;
  margin-bottom: 20px;
}

/* ✅ 폼 입력 필드 */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.input-field {
  min-width: 120px;
  max-width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* ✅ 보강 관련 입력 필드 가로 정렬 */
.inline-group {
  display: flex;
  gap: 10px;
}

.inline-group .form-group {
  flex: 1;
}

/* ✅ 버튼 정렬 */
.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button.back {
  background-color: #ccc;
  color: black;
}

button.back:hover {
  background-color: #b3b3b3;
}

button.register {
  background-color: #485ff7;
  color: white;
  border: none;
}

button.register:hover {
  background-color: #5fb7ff;
}
</style>
