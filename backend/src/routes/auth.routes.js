// Auth routes (SRS 6.2, UC-1/UC-2, FR-1/FR-2).
//   POST /api/auth/register
//   POST /api/auth/login
//   POST /api/auth/logout
//   POST /api/auth/forgot-password
//   POST /api/auth/reset-password
import { Router } from 'express';
import {
  register, login, logout, forgotPassword, resetPassword,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
