import express from "express";
import { createCourse, getCourses, deleteTimetable, getAvailableCourses } from "../controllers/coursesController.js";

const router = express.Router();

// ✅ 과목 추가
router.post("/", createCourse);

// ✅ 과목 조회
router.get("/", getCourses);

router.delete("/:course_id", deleteTimetable);

// 분반 데이터 조회
router.get("/available", getAvailableCourses);

export default router;
