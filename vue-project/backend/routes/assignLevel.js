import express from "express";
import { saveAssignments, getAssignments, getGroupList,
  getAssignmentsByGroup, getAllGroupAssignmentsHandler } from "../controllers/courseLevelController.js";

const router = express.Router();
router.post("/", saveAssignments);

router.get("/groups", getGroupList);
router.get("/group/:groupId", getAssignmentsByGroup);
router.get("/:studentId", getAssignments);
router.get("/groups/with-students", getAllGroupAssignmentsHandler);

export default router;
