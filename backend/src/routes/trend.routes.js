// Behavioral-trend routes (SRS 6.2, UC-7, FR-10).
//   GET /api/trends   changes in risk score, sentiment and emotional
//                     patterns across previous analyses
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getTrends } from '../controllers/trend.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', getTrends);

export default router;
