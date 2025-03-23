<script setup>
  import { RouterView } from "vue-router";
  import HeaderPage from "@/components/Header.vue";
  import { useAuthStore } from "@/stores/auth";
  import { onMounted } from "vue";

  const auth = useAuthStore();

  onMounted(async () => {
    await auth.fetchUser();
  });
</script>

<template>
  <template v-if="!auth.isAuthenticated || auth.user?.approved === 0">
      <div class="pending-approval">
        <nav>
          <HeaderPage />
        </nav>

        <h2 v-if="!auth.isAuthenticated"> 로그인해주세요 </h2>
        <h2 v-else>승인을 기다려주세요</h2>

      </div>
    </template>
    <template v-else>
      <nav>
          <router-link to="/">홈</router-link>
          <router-link to="/notices">공지사항</router-link>
          <router-link to="/timetable">시간표</router-link>
          <router-link to="/approval">관리자 페이지</router-link>
          <HeaderPage />
      </nav>
      <router-view />
    </template>
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
