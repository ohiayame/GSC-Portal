import express from 'express';
import { googleLogin, registerUser, logoutUser, getUser, getAllUsers, approveUser, rejectUser } from '../controllers/usersController.js';

const router = express.Router();

// ✅ Google 로그인 (회원 여부 확인)
router.post('/google/callback', googleLogin);

// ✅ 회원가입 요청
router.post('/register', registerUser);

// ✅ 사용자 정보 조회
router.get('/user', getUser);

// ✅ 로그아웃
router.post('/logout', logoutUser);


router.get('/all-users', getAllUsers);
router.put('/approve-user/:id', approveUser );
router.delete('/reject-user/:id', rejectUser );

export default router;
