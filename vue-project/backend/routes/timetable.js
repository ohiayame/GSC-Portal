import express from "express";
import {
  getAllTimetables,
  getTimetableByGrade,
  createTimetable,
  updateTimetable
} from "../controllers/timetableController.js";

const router = express.Router();

// ✅ 전체 시간표 조회
router.get("/", getAllTimetables);

// ✅ 특정 학년 시간표 조회
router.get("/:grade", getTimetableByGrade);

// ✅ 시간표 추가
router.post("/", createTimetable);

router.put('/:course_id', updateTimetable);

export default router;
