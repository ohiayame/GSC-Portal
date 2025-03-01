<script setup>
import { useAuthStore } from '@/stores/auth';
import { onMounted, watch, nextTick, computed } from 'vue';

const auth = useAuthStore();
const user = computed(() => auth.user);

// ✅ Google 로그인 버튼 렌더링 함수
function renderGoogleLoginButton() {
    nextTick(() => {
        const googleLoginDiv = document.getElementById("google-login-btn");
        if (googleLoginDiv) {
            googleLoginDiv.innerHTML = "";  // ⚠ 기존 버튼 삭제 (중복 생성 방지)
            google.accounts.id.renderButton(googleLoginDiv, {
                theme: "outline",
                size: "large"
            });
        }
    });
}

// ✅ 로그인 상태 확인 후 버튼 렌더링
onMounted(async () => {
    await auth.fetchUser();  // 로그인 상태 확인

    window.onload = function () {
        google.accounts.id.initialize({
            client_id: "987553472207-e5di53499ihc4mi6hg8e0d2oinfqaovj.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            ux_mode: "redirect",
            login_uri: "http://localhost:3001/auth/google/callback"
        });

        // ✅ Google 버튼 렌더링 실행
        renderGoogleLoginButton();
    };
});

// ✅ 로그인 후 사용자 정보 업데이트
async function handleCredentialResponse(response) {
    console.log("Google Login Response:", response);

    try {
        const res = await fetch("http://localhost:3001/auth/google/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();
        if (data.success) {
            auth.setUser(data.user);
            auth.isAuthenticated = true;  // ✅ 로그인 상태 업데이트
        }
    } catch (error) {
        console.error("로그인 요청 오류:", error);
    }
}

// ✅ 로그아웃 후 Google 버튼 다시 렌더링
async function logout() {
    await auth.logout();  // ✅ 쿠키 삭제 요청
    auth.fetchUser();     // ✅ 로그아웃 후 로그인 상태 다시 확인
}

// ✅ 로그인 상태 변화 감지 → Google 버튼 다시 렌더링
watch(() => auth.isAuthenticated, (newVal) => {
    if (!newVal) {
        renderGoogleLoginButton();  // ✅ 로그아웃 후 버튼 다시 생성
    }
});
</script>

<template>
    <div class="header">
        <!-- ✅ 로그인 상태가 아닐 때만 Google 로그인 버튼 표시 -->
        <div v-if="!auth.isAuthenticated" id="google-login-btn"></div>
        <div v-else>
            <span>{{ user?.name }} 님   </span>
            <button  @click="logout">로그아웃</button>
        </div>
    </div>
</template>

<style scoped>
button {
  padding: 8px;
  border: 1px solid #cccccc00;
  background-color: #4d8eff;
  color: white;
  cursor: pointer;
}
</style>
