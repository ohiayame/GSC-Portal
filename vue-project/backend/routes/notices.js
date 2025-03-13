import express from 'express';
import {
  getNotices,
  getNoticeById,
  uploadFile,
  createNotice,
  updateNotice,
  deleteNotice,
  deleteNoticeFile
} from '../controllers/noticesController.js';

const router = express.Router();

// ✅ API 라우팅 → 컨트롤러 호출
router.get("/", getNotices);
router.get('/:id', getNoticeById);
router.post("/upload", uploadFile);
router.use("/uploads", express.static("uploads"));
router.post('/', createNotice);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);

router.delete("/delete-file/:filename", deleteNoticeFile);

export default router;
