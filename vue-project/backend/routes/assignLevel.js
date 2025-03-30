import express from "express";
import { saveAssignments } from "../controllers/courseLevelController.js";

const router = express.Router();
router.post("/", saveAssignments);

export default router;
