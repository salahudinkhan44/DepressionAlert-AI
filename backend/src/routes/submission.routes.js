// Submission routes — Data Collection Module (SRS 6.2, UC-4,
// FR-4/FR-5/FR-6).
//   POST /api/submissions/text    manual paste (JSON)
//   POST /api/submissions/csv     CSV batch upload (multipart/form-data)
//   GET  /api/submissions/posts   stored posts (Post & Comment Deep Dive)
// Both run validateAndStorePost() semantics: consent check, empty /
// malformed / duplicate rejection (SDD 6.1).
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireConsent } from '../middleware/consent.middleware.js';
import { csvUpload } from '../middleware/upload.middleware.js';
import { submitText, submitCsv, getPosts } from '../controllers/submission.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/posts', getPosts);
router.post('/text', requireConsent, submitText);
router.post('/csv', requireConsent, csvUpload, submitCsv);

export default router;
