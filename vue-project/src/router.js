import { createRouter, createWebHistory } from "vue-router";
import checkbox from "./project/checkbox.vue"; // project 폴더에서 가져오기

const routes = [
  { path: "/", component: checkbox } // 기본 경로를 study 폴더의 파일로 설정
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
