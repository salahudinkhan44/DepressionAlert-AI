// Crisis-support resource routes (SRS 6.2, UC-8, FR-12).
//   GET /api/crisis-support   helplines, emergency contacts, calming
//                             exercises and educational resources
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getCrisisResources } from '../controllers/crisisSupport.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', getCrisisResources);

export default router;
