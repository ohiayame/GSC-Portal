import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/Home.vue";
import RegisterPage from "@/pages/Register.vue";
import NoticesPage from "@/pages/Notices.vue";
import TimetablePage from "@/pages/Timetable.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/register", component: RegisterPage },
  { path: "/notices", component: NoticesPage },
  { path: "/timetable", component: TimetablePage }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
