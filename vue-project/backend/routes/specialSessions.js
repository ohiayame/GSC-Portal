import express from "express";
import {
  getAllSpecialSessions,
  getSpecialSessionsByCourse,
  getSpecialSessionsByDate,
  createSpecialSession,
  deleteSpecialSession
} from "../controllers/specialSessionController.js";

const router = express.Router();

// ✅ 전체 휴·보강 조회
router.get("/", getAllSpecialSessions);

// ✅ 특정 과목의 휴·보강 조회
router.get("/course/:course_id", getSpecialSessionsByCourse);

// ✅ 특정 날짜의 휴·보강 조회
router.get("/date/:date", getSpecialSessionsByDate);

// ✅ 휴·보강 추가
router.post("/", createSpecialSession);

// ✅ 휴·보강 삭제
router.delete("/:id", deleteSpecialSession);

export default router;
