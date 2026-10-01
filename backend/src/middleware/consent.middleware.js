// Consent middleware.
// Blocks text/CSV processing unless user.consent_given is true
// (FR-3, SEC-2; SDD 6.1 "Consent required").
import { ApiError } from './errorHandler.middleware.js';

export function requireConsent(req, res, next) {
  if (!req.user?.consentGiven) {
    return next(
      new ApiError(403, 'Consent required — please grant data-processing consent first.')
    );
  }
  next();
}
