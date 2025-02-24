<script setup>
import { onMounted } from 'vue';

const GOOGLE_CLIENT_ID = "987553472207-g6blggkolv23g1ppqj1ksbs3ld7fe8k3.apps.googleusercontent.com";

// ✅ Google 로그인 팝업 열기 (중복 방지)
const openGoogleLogin = () => {
    console.log("🔹 Google 로그인 창 열기");
    if (window.loginPopup && !window.loginPopup.closed) {
        console.warn("🚨 이미 로그인 창이 열려 있습니다!");
        return;
    }

    window.location.href = 'http://localhost:3000/auth/google';

    // ✅ 팝업 창에서 메시지 수신 후 로그인 상태 확인
    window.addEventListener("message", (event) => {
        if (event.origin !== "http://localhost:5173") return; // 보안 체크
        console.log("📌 수신된 메시지:", event.data);
        if (event.data.success) {
            console.log("✅ Google 로그인 성공! 상태 확인 중...");
            checkLoginStatus(true); // ✅ 로그인 상태 확인 후 이동
        }
    }, { once: true }); // ✅ 중복 실행 방지
};

// ✅ 현재 로그인 상태 확인
const checkLoginStatus = async (redirect = false) => {
    try {
        const response = await fetch('http://localhost:3000/auth/user', { 
        credentials: 'include' });
        
        // 🚨 백엔드에서 응답이 제대로 안 왔으면 여기서 멈춤!
        const data = await response.json();

        if (data.user) {
            console.log("✅ 로그인 상태 유지됨!", data.user);
            if (redirect) {
                setTimeout(() => {
                    window.location.href = 'http://localhost:5173';  // ✅ 쿠키 확인 후 이동
                }, 500);
            }
        } else {
            console.error("❌ 로그인 상태 확인 실패:", data.message);
        }
    } catch (error) {
        console.error("❌ 로그인 확인 실패:", error);
    }
};

onMounted(() => {
    checkLoginStatus(); // ✅ 로그인 상태 확인

    if (window.google && window.google.accounts) {
        console.log("✅ Google API 로드됨!");

        // ✅ Google 로그인 버튼 렌더링 (자동 로그인 비활성화)
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID
        });

        window.google.accounts.id.renderButton(
            document.getElementById('google-signin-btn'),
            { theme: 'outline', size: 'large' }
        );

        // ✅ Google의 자동 로그인 이벤트 제거 (팝업 중복 실행 방지)
        setTimeout(() => {
            const googleBtn = document.getElementById('google-signin-btn');
            const clonedBtn = googleBtn.cloneNode(true);
            googleBtn.parentNode.replaceChild(clonedBtn, googleBtn);

            // ✅ 이제 버튼을 클릭하면 우리가 만든 `openGoogleLogin()`만 실행됨
            clonedBtn.addEventListener('click', (event) => {
                event.preventDefault(); // 기본 이벤트 방지
                console.log("🔹 Google 로그인 버튼 클릭됨 → openGoogleLogin 실행");
                openGoogleLogin();
            });
        }, 1000); // 🔹 Google 버튼이 렌더링된 후 이벤트 제거 실행 (약간의 딜레이 필요)
    } else {
        console.error("❌ Google API가 로드되지 않았습니다.");
    }
});
</script>

<template>
    <div class="login-container">
        <h1>로그인</h1>
        <!-- ✅ Google 로그인 버튼을 그대로 유지 -->
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
