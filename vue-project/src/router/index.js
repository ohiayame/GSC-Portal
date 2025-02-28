import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/Home.vue";
import RegisterPage from "@/pages/Register.vue";
import NoticesPage from "@/pages/Notices.vue";
import NoticeItem from '@/components/NoticeItem.vue';
import NoticeForm from '@/components/NoticeForm.vue';

import TimetablePage from "@/pages/Timetable.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/register", component: RegisterPage },
  { path: "/notices", component: NoticesPage },
  { path: '/notices/:id', component: NoticeItem, props: true }, // 공지사항 상세 페이지
  { path: '/notices/new', component: NoticeForm }, // 새 공지 작성
  { path: '/notices/edit/:id', component: NoticeForm, props: true }, // 공지 수정
  { path: "/timetable", component: TimetablePage }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
