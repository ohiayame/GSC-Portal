import express from 'express';
import {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
} from '../controllers/noticesController.js';

const router = express.Router();

// ✅ API 라우팅 → 컨트롤러 호출
router.get('/', getAllNotices);
router.get('/:id', getNoticeById);
router.post('/', createNotice);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);

export default router;
