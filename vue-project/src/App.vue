<script setup>
import { ref, onMounted, watchEffect } from "vue";
import { RouterView, useRouter } from "vue-router";
import axios from "axios";

const isLoggedIn = ref(false); // ✅ 로그인 상태 관리
const router = useRouter();
const user = ref(null);

// ✅ 로그인 상태 확인
const checkLoginStatus = async () => {
    try {
        const response = await axios.get('http://localhost:3000/auth/user', { withCredentials: true });

        if (response.data.user) {
            user.value = {
                name: response.data.user.userName.givenName,
                email: response.data.user.email
            };
            isLoggedIn.value = true; // ✅ 로그인 상태 업데이트
            console.log("✅ 로그인 상태 유지됨:", isLoggedIn.value);
        } else {
            isLoggedIn.value = false;
            console.log("❌ 로그인되지 않음");
        }
    } catch (error) {
        isLoggedIn.value = false;
        console.error("❌ 사용자 정보를 불러오지 못했습니다:", error);
    }
};

// ✅ 로그아웃 처리
const logout = async () => {
    try {
        await axios.get("http://localhost:3000/auth/logout", { withCredentials: true });
        isLoggedIn.value = false; // ✅ 로그아웃 후 상태 변경
        user.value = null; // ✅ 사용자 정보 초기화
        window.location.href = "/login"; 
    } catch (error) {
        console.error("로그아웃 실패:", error);
    }
};

// ✅ 컴포넌트가 실행될 때 로그인 상태 확인
onMounted(() => {
    checkLoginStatus();
});

// ✅ 로그인 상태 변경을 감지하여 UI 업데이트
watchEffect(() => {
    console.log("🔄 UI 업데이트 - 현재 로그인 상태:", isLoggedIn.value);
});
</script>

<template>
  <nav class="navbar">
    <div class="nav-menu">
      <router-link to="/">홈</router-link>
      <router-link to="/check">체크박스</router-link>
      <router-link to="/count">설정</router-link>
      <router-link to="/user">사용자</router-link>
      <router-link to="/schedule">스케줄</router-link>
    </div>

    <!-- ✅ 로그인 상태에 따라 UI 변경 -->
    <div class="auth-menu">
      <router-link v-if="!isLoggedIn" to="/login">로그인</router-link>
      <div v-else class="user-info">
        <span class="user-name">{{ user.name }} 님</span>
        <button class="logout-btn" @click="logout">로그아웃</button>
      </div>
    </div>
  </nav>

  <router-view />
</template>

<style scoped>
/* ✅ 네비게이션 바 전체 스타일 */
.navbar {
  display: flex;
  justify-content: space-between; /* 좌우 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  background: #222;
  padding: 10px 20px;
  height: 50px;
}

/* ✅ 왼쪽 메뉴 */
.nav-menu {
  display: flex;
  gap: 20px;
}

/* ✅ 오른쪽 로그인/로그아웃 메뉴 */
.auth-menu {
  display: flex;
  align-items: center;
  gap: 15px; /* 버튼과 이름 간격 */
}

/* ✅ 사용자 정보 영역 (가로 정렬 적용) */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px; /* 사용자 이름과 버튼 간격 */
}

/* ✅ 사용자 이름 스타일 */
.user-name {
  color: white;
  font-size: 16px;
}

/* ✅ 네비게이션 링크 & 버튼 스타일 */
.nav-menu a, .auth-menu a, .logout-btn {
  color: white;
  text-decoration: none;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

/* ✅ 로그아웃 버튼 스타일 */
.logout-btn {
  color: red;
}
</style>
