<script setup>
import { RouterView } from "vue-router";
</script>

<template>
    <nav class="navbar">
      <div class="nav-menu">
        <router-link to="/">홈</router-link>
        <router-link to="/check">체크박스</router-link>
        <router-link to="/count">설정</router-link>
        <router-link to="/user">사용자</router-link>
        <router-link to="/login">로그인</router-link>
      </div>
    </nav>
  <router-view />
</template>


<style scoped>
.navbar {
  display: flex;
  justify-content: center;
  background: #222;
  padding: 10px 0;
}
.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  padding: 10px;
}
</style>
