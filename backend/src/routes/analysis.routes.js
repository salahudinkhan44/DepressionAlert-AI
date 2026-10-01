// Analysis routes (SRS 6.2, UC-5/UC-6, FR-9/FR-14).
//   GET /api/analysis/latest    latest risk score + risk level (UC-5)
//   GET /api/analysis/history   previous results by date (UC-6)
//   GET /api/analysis/:id       single result detail
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getLatest, getHistory, getById } from '../controllers/analysis.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/latest', getLatest);
router.get('/history', getHistory);
router.get('/:id', getById);

export default router;
