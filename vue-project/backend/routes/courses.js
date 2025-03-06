import express from "express";
import { createCourse, getCourses, deleteTimetable } from "../controllers/coursesController.js";

const router = express.Router();

// ✅ 과목 추가
router.post("/", createCourse);

// ✅ 과목 조회
router.get("/", getCourses);

router.delete("/:id", deleteTimetable);

export default router;
