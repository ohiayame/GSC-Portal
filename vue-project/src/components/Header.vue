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
                size: "large",
                shape:"pill"
            });
        }
    });
}

// ✅ 로그인 상태 확인 후 버튼 렌더링
onMounted(async () => {
    await auth.fetchUser();  // 로그인 상태 확인

    window.onload = function () {
        console.log("✅ Google 로그인 버튼 로딩 완료");
        google.accounts.id.initialize({
            client_id: "987553472207-e5di53499ihc4mi6hg8e0d2oinfqaovj.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            ux_mode: "popup",  // 🔥 여기서 "redirect" → "popup"으로 변경
        });

        // ✅ Google 버튼 렌더링 실행
        console.log("🔹 Google 로그인 버튼 렌더링 실행");
        renderGoogleLoginButton();
    };
});


// ✅ 로그인 후 사용자 정보 업데이트
async function handleCredentialResponse(response) {
    console.log("Google Login Response:", response);

    try {
      console.log("🚀 fetch() 요청 시작!");
        const res = await fetch("http://localhost:3001/auth/google/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential })
        });
        console.log("🔍 서버 응답 데이터:", res);
        const data = await res.json();
        console.log("🔍 서버 응답 데이터:", data);  // 서버 응답 로그 출력

        if (data.success) {
            auth.login(data);

            // window.location.href = "/";

        } else if(data.redirect) {
            console.log(`🔄 페이지 이동: ${data.redirect}`);
            const url= `${data.redirect}?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(data.name)}`;

            // alert("📌 이동할 URL:"+ url);
            window.location.href = url;  // ✅ 로그인 상태 업데이트

        } else {
            alert("승인을 기다려주세요")
            console.error("⚠ 이동할 경로 없음");
        }
    } catch (error) {
        console.error("로그인 요청 오류:", error);
    }
}

// ✅ 로그아웃 후 Google 버튼 다시 렌더링
async function logout() {
    await auth.logout();  // ✅ 쿠키 삭제 요청
    window.location.href = "/";
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
