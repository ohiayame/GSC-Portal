import express from "express";
import { saveAssignments, getAssignments, getGroupList, getAssignmentsByGroup } from "../controllers/courseLevelController.js";

const router = express.Router();
router.post("/", saveAssignments);

router.get("/groups", getGroupList);
router.get("/group/:groupId", getAssignmentsByGroup);
router.get("/:studentId", getAssignments);
export default router;
