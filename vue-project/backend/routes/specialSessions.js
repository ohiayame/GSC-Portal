import express from "express";
import {
  getAllSpecialSessions,
  createSpecialSession,
} from "../controllers/specialSessionController.js";

const router = express.Router();

// ✅ 전체 휴·보강 조회
router.get("/", getAllSpecialSessions);

// ✅ 휴·보강 추가
router.post("/", createSpecialSession);



export default router;
