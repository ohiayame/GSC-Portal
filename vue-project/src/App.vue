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

        <h2 v-if="!auth.isAuthenticated"> 로그인해주세요 </h2>
        <h2 v-else>승인을 기다려주세요</h2>

        <nav class="login">
          <HeaderPage />
        </nav>

      </div>
    </template>
    <template v-else>
      <nav class="page">
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
.login {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 10px 20px;
  height: 50px;
}
.page{
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #a0bad7;
  padding: 10px 20px;
  height: 50px;
}

.page a {
  color: aliceblue;
  text-decoration: none;
  margin: 0 10px;
  font-weight: bold;
}

.pending-approval {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  background-color: #f7f9fc;
}

.pending-approval h2 {
  font-size: 24px;
  color: #3a4f7a;
  margin-top: 30px;
  padding: 15px 30px;
  background-color: #e1ecf7;
  border: 1px solid #aac4de;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}


</style>
