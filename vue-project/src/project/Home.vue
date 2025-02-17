<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useDataStore } from '../stores/data';

const store = useDataStore();
const user = ref(null);

onMounted(async () => {
    try {
        //  API 요청 (쿠키 기반 인증을 사용)
        const response = await axios.get('http://localhost:3000/auth/user', { withCredentials: true });
        user.value = response.data;
    } catch (error) {
        console.error('사용자 정보를 불러오지 못했습니다:', error);
    }
});
// 로그아웃
const logout = async () => {
    try {
        await axios.get('http://localhost:3000/auth/logout', { withCredentials: true });
    } catch (error) {
        console.error("로그아웃 실패:", error);
    }
    window.location.href = '/login'; // 로그인 페이지로 이동
};

</script>

<template>
    <div v-if="user">
        <p>환영합니다, {{ user.displayName }} 님!</p>

        <h1>📌 데이터 요약</h1>

        <h2>🔢 숫자 카운트</h2>
        <p>현재 숫자: {{ store.count }}</p>

        <h2>📋 체크리스트</h2>
        <ul>
            <li v-for="(subject, index) in store.subjects" :key="index">
            <span :style="{ textDecoration: subject.checked ? 'line-through' : 'none' }">
                {{ subject.text }}
            </span>
            </li>
        </ul>


    <br><br>
        
        <button @click="logout">로그아웃</button>
    </div>
    <div v-else>
        <h1>홈페이지</h1>
    </div>
</template>
