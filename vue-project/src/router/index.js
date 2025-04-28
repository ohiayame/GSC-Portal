import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/Home.vue";
import RegisterPage from "@/pages/Register.vue";

import AdminApprovalPage from "@/pages/AdminApproval.vue";
import AssignLevelPage from "@/components/AssignLevel.vue";

import NoticesPage from "@/pages/Notices.vue";
import NoticeItem from '@/components/NoticeItem.vue';
import NoticeForm from '@/components/NoticeForm.vue';

import TimetablePage from "@/pages/Timetable.vue";
import TimetableForm from "@/components/TimetableForm.vue"; // 📌 시간표 등록/수정 폼 추가
import SpecialSessionForm from "@/components/SpecialSessionForm.vue";
import TimetableManage from "@/components/TimetableManage.vue";

import CalendarPage from '@/pages/CalendarPage.vue'



// 일본어
// 일본어 페이지 (jp 폴더에서 import)
import JpHomePage from "@/pages/jp/Home.vue";
import JpRegisterPage from "@/pages/jp/Register.vue";
import JpAdminApprovalPage from "@/pages/jp/AdminApproval.vue";
import JpAssignLevelPage from "@/components/jp/AssignLevel.vue";

import JpNoticesPage from "@/pages/jp/Notices.vue";
import JpNoticeItem from "@/components/jp/NoticeItem.vue";
import JpNoticeForm from "@/components/jp/NoticeForm.vue";

import JpTimetablePage from "@/pages/jp/Timetable.vue";
import JpTimetableForm from "@/components/jp/TimetableForm.vue";
import JpSpecialSessionForm from "@/components/jp/SpecialSessionForm.vue";
import JpTimetableManage from "@/components/jp/TimetableManage.vue";

import JpCalendarPage from "@/pages/jp/CalendarPage.vue";


const routes = [
  { path: "/", component: HomePage },
  { path: "/register", component: RegisterPage },
  { path: "/approval", component: AdminApprovalPage },
  { path: "/assignLevel", component: AssignLevelPage},

  { path: "/notices", component: NoticesPage },
  { path: '/notices/:id', component: NoticeItem, props: true }, // 공지사항 상세 페이지
  { path: '/notices/new', component: NoticeForm }, // 새 공지 작성
  { path: '/notices/edit/:id', component: NoticeForm, props: true }, // 공지 수정

  { path: "/timetable", component: TimetablePage }, // 전체 시간표 보기
  { path: "/timetable/new", component: TimetableForm }, // 신규 시간표 등록
  { path: "/timetable/edit/:id", component: TimetableForm, props: true }, // 기존 시간표 수정
  { path: "/timetable/special", component: SpecialSessionForm }, // 보강/휴강 추가
  { path: "/timetable/manage", component: TimetableManage },
  { path: '/calendar', component: CalendarPage },

  // 일본어 라우트
  { path: "/jp", component: JpHomePage },
  { path: "/jp/register", component: JpRegisterPage },
  { path: "/jp/approval", component: JpAdminApprovalPage },
  { path: "/jp/assignLevel", component: JpAssignLevelPage },

  { path: "/jp/notices", component: JpNoticesPage },
  { path: "/jp/notices/:id", component: JpNoticeItem, props: true },
  { path: "/jp/notices/new", component: JpNoticeForm },
  { path: "/jp/notices/edit/:id", component: JpNoticeForm, props: true },

  { path: "/jp/timetable", component: JpTimetablePage },
  { path: "/jp/timetable/new", component: JpTimetableForm },
  { path: "/jp/timetable/edit/:id", component: JpTimetableForm, props: true },
  { path: "/jp/timetable/special", component: JpSpecialSessionForm },
  { path: "/jp/timetable/manage", component: JpTimetableManage },
  { path: "/jp/calendar", component: JpCalendarPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
