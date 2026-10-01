// Dashboard routes — Dashboard Module (M6, SDD 6; FR-13, USE-2).
//   GET /api/dashboard/monitor   live sentiment-monitor feed (SDD 8.1.1)
//   GET /api/dashboard/summary   aggregated score/level/alert summary
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getMonitorFeed, getDashboardSummary } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/monitor', getMonitorFeed);
router.get('/summary', getDashboardSummary);

export default router;
