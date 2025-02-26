<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();  // 정보 들고 오는 것
const router = useRouter();   // 회원가입 페이지 이동시 사용용

const login = async () => {
    // 로그인 
    // auth으로 로그인 정보를 들고 오기
    // 정보가 있으면 화면 표시
    // 정보가 없으면 구글 로그인 진행
    pass
};

const logout = () => {
    // 로그아웃
    // 로그인 정보 삭제
    pass
};
</script>

<template>
    <div class="header">
        <button v-if="!auth.isAuthenticated" @click="login">로그인</button>
        <button v-if="auth.isAuthenticated" @click="logout">로그아웃</button>
    </div>
</template>
