// Alert routes (SRS 6.2, UC-8, FR-11).
//   GET   /api/alerts          user's alerts
//   PATCH /api/alerts/:id      update status (New -> Viewed | Dismissed)
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getAlerts, updateAlertStatus } from '../controllers/alert.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAlerts);
router.patch('/:id', updateAlertStatus);

export default router;
