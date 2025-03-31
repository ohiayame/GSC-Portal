import express from "express";
import { saveAssignments, getAssignments } from "../controllers/courseLevelController.js";

const router = express.Router();
router.post("/", saveAssignments);
router.get("/:studentId", getAssignments);

export default router;
