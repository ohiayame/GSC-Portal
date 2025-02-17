<script setup>
import { onMounted } from 'vue';
// 방급 받은 id
const GOOGLE_CLIENT_ID = "987553472207-g6blggkolv23g1ppqj1ksbs3ld7fe8k3.apps.googleusercontent.com";

const openGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google'; 
};

// Google 로그인 버튼을 초기화하고 렌더링 (컴포넌트가 DOM에 추가된 후 실행)
onMounted(() => {
    if (window.google && window.google.accounts) { // Google API가 정상적으로 로드되었는지 확인
        console.log("✅ Google API 로드됨!");

        // Google 로그인 클라이언트를 초기화
        window.google.accounts.id.initialize({ // Google OAuth 로그인 기능을 설정하는 메서드
            client_id: GOOGLE_CLIENT_ID,
            callback: openGoogleLogin
        });
        // Google에서 제공하는 표준 로그인 버튼을 자동으로 생성
        window.google.accounts.id.renderButton(
            document.getElementById('google-signin-btn'),
            { theme: 'outline', size: 'large' } // Google 버튼 스타일
        );
    } else {
        console.error("❌ Google API가 로드되지 않았습니다.");
    }
});
</script>

<template>
    <div class="login-container">
        <h1>로그인</h1>
        <!-- Google에서 제공하는 로그인 버튼 -->
        <div id="google-signin-btn"></div>
    </div>
</template>

<style>
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
}
</style>
