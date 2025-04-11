import express from "express";
import { getAll, add, remove } from "../controllers/allowedEmailController.js";

const router = express.Router();

router.get("/", getAll);
router.post("/", add);
router.delete("/:email", remove);

export default router;
