<script setup>
import { useAuthStore } from '@/stores/auth';
import { onMounted } from 'vue';

const auth = useAuthStore();

// ✅ 로그인 상태 확인을 위한 fetchUser() 실행
onMounted(async () => {
    await auth.fetchUser();  // 로그인 상태 확인

    window.onload = function () {
        google.accounts.id.initialize({
            client_id: "987553472207-e5di53499ihc4mi6hg8e0d2oinfqaovj.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            ux_mode: "redirect",
            login_uri: "http://localhost:3001/auth/google/callback"
        });

        google.accounts.id.renderButton(
            document.getElementById("google-login-btn"),
            { theme: "outline", size: "large" }
        );
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
            await auth.fetchUser(); 
        }
    } catch (error) {
        console.error("로그인 요청 오류:", error);
    }
}
async function logout() {
    await auth.logout();  // ✅ 쿠키 삭제 요청
    await auth.fetchUser();     // ✅ 로그아웃 후 로그인 상태 다시 확인
}

</script>

<template>
    <div class="header">
        <!-- ✅ 로그인 상태가 아닐 때만 Google 로그인 버튼 표시 -->
        <div v-if="!auth.isAuthenticated" :key="auth.isAuthenticated" id="google-login-btn"></div>
        <button v-if="auth.isAuthenticated" @click="logout">로그아웃</button>
    </div>
</template>
