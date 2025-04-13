<script setup>
import { useAuthStore } from '@/stores/auth';
import { onMounted, watch, nextTick, computed } from 'vue';
import { initializeGoogleLogin, renderGoogleLoginButton } from '@/composables/useGoogleLogin';

const auth = useAuthStore();
const user = computed(() => auth.user);

const CLIENT_ID = "987553472207-e5di53499ihc4mi6hg8e0d2oinfqaovj.apps.googleusercontent.com";

// ✅ 로그인 상태 확인 후 버튼 렌더링
onMounted(async () => {
  initializeGoogleLogin(CLIENT_ID, handleCredentialResponse);
});

// ✅ 로그인 후 사용자 정보 업데이트
const handleCredentialResponse = async (response) => {
  const result = await auth.loginWithGoogleCredential(response.credential);

  console.log(result)
  if (result.status === "success") {
    // 로그인 완료 처리 (별도 이동 없음)
  } else if (result.status === "redirect") {
    const url = `${result.redirect}?email=${encodeURIComponent(result.email)}&name=${encodeURIComponent(result.name)}`;
    window.location.href = url;
  } else if (result.status === "pending") {
    alert("승인을 기다려주세요");
  } else if (result.status === "error") {
    alert(result.error);
  }
};


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
