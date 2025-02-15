<!-- Home.vue -->
<script setup>
import { useDataStore } from '../stores/data';

const store = useDataStore();
</script>

<template>
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

</template>
