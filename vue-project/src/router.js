import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./project/Home.vue";
import CheckboxPage from "./project/checkbox.vue";
import CountPage from "./project/num.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/check", component: CheckboxPage },
  { path: "/count", component: CountPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
