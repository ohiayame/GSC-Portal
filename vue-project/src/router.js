import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./project/Home.vue";
import CheckboxPage from "./project/checkbox.vue";
import CountPage from "./project/num.vue";
import UserPage from "./project/UserList.vue";
import LoginPage from "./project/Login.vue";
import SchedulePage from "./project/Schedule.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/check", component: CheckboxPage },
  { path: "/count", component: CountPage },
  { path: "/user", component: UserPage },
  { path: "/login", component: LoginPage },
  { path: "/schedule", component: SchedulePage }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
