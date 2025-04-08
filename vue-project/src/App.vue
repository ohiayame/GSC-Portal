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
  <template v-if="$route.path === '/register'">
    <router-view />
  </template>
  <template v-else-if="
    !auth.isAuthenticated || auth.user?.approved === 0">

      <div class="pending-approval">
        <h2 > 로그인해주세요 </h2>

        <nav class="login">
          <HeaderPage />
        </nav>

      </div>
    </template>

    <template v-else>
      <nav class="page">
          <router-link to="/" class="home">GSC-PORTAL</router-link>
          <router-link to="/notices">공지사항</router-link>
          <router-link to="/timetable">시간표</router-link>
          <router-link to="/calendar">스케줄</router-link>
          <router-link to="/approval" v-if="auth.user.role ==='관리자'">관리자 페이지</router-link>
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
  background: #d3e7ff;
  padding: 10px 20px;
  height: 50px;
}
.page .router-link-active {
  color: rgb(49, 145, 235);
  font-weight: bolder;
  border-bottom: 2px solid white;
}


.page a {
  color: rgba(22, 32, 66, 0.511);
  text-decoration: none;
  margin: 0 10px;
  font-weight: bold;
}
.page .home{
  font-size: 24px;
  color: rgb(49, 145, 235);
}

.pending-approval {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background: linear-gradient(135deg, #f0f5ff, #e8f0ff);
}

.pending-approval h2 {
  font-size: 24px;
  color: #3a4f7a;
  margin-top: 30px;
  padding: 15px 30px;
  background-color: #f3f9ff;
  border: 1px solid #aac4de;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}


</style>
