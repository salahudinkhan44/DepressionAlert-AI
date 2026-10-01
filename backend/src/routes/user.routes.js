// User routes.
//   GET   /api/users/me                  profile
//   PATCH /api/users/me                  account details
//   PATCH /api/users/me/password         change password (SEC-3)
//   PUT   /api/users/me/consent          grant/revoke data-processing
//                                        consent (FR-3, SEC-2)
//   GET   /api/users/me/settings         preventive-action settings
//   PATCH /api/users/me/settings         (SDD 8.2)
//   POST  /api/users/me/activity         log a preventive action
//   GET   /api/users/viewer/cases        Authorized Viewer caseload
//   GET   /api/users/viewer/cases/:id    read-only case detail (SEC-5)
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  getMe, updateMe, changePassword, updateConsent,
  getSettings, updateSettings, logActivity,
  getViewerCases, getViewerCaseDetail,
} from '../controllers/user.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/me/password', changePassword);
router.put('/me/consent', updateConsent);
router.get('/me/settings', getSettings);
router.patch('/me/settings', updateSettings);
router.post('/me/activity', logActivity);

// Authorized Viewer role (SDD 5.1 User.role) — read-only results.
router.get('/viewer/cases', requireRole('Authorized Viewer'), getViewerCases);
router.get('/viewer/cases/:id', requireRole('Authorized Viewer'), getViewerCaseDetail);

export default router;
