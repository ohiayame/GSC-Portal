<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div>
    <h1>🚀 내 프로젝트</h1>
    <RouterView />  <!-- 라우터로 연결된 페이지가 여기에 표시됨 -->
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
  color: blue;
}
</style>
