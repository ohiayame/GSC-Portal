<script setup>
  import { RouterView } from "vue-router";
  import HeaderPage from "@/components/Header.vue";
</script>

<template>
  <nav>
      <router-link to="/">홈</router-link>
      <router-link to="/notices">공지사항</router-link>
      <router-link to="/timetable">시간표</router-link>
      <HeaderPage />
  </nav>
  
  <router-view />
</template>

<style scoped>
nav{
  display: flex;
  justify-content: space-between; /* 좌우 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  background: #a0bad7;
  padding: 10px 20px;
  height: 50px;
}
nav a{
  color: aliceblue;
  text-decoration: none;
}
</style>
