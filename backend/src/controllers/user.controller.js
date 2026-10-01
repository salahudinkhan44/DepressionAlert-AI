// User controller.
// Profile read/update and consent grant/revoke (FR-3, SEC-2), per-user
// settings (SDD 8.2 preventive actions), activity logging, and the
// read-only Authorized Viewer caseload (SDD 5.1 User.role).
import User from '../models/User.js';
import AnalysisResult from '../models/AnalysisResult.js';
import { ApiError } from '../middleware/errorHandler.middleware.js';
import { analysisToClient } from '../utils/serializers.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getMe(req, res) {
  res.json(req.user.toClient());
}

// PATCH /api/users/me — account details (name, email).
export async function updateMe(req, res, next) {
  try {
    const { name, email } = req.body || {};
    if (name !== undefined) {
      if (name.trim().length < 2) throw new ApiError(400, 'Enter your full name.');
      req.user.name = name.trim();
    }
    if (email !== undefined) {
      const normalized = email.toLowerCase().trim();
      if (!EMAIL_RE.test(normalized)) throw new ApiError(400, 'Enter a valid email.');
      const taken = await User.findOne({ email: normalized, _id: { $ne: req.user._id } });
      if (taken) throw new ApiError(409, 'This email is already registered. Try logging in.');
      req.user.email = normalized;
    }
    await req.user.save();
    res.json(req.user.toClient());
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/me/password — verify current, store new salted hash
// (SEC-3).
export async function changePassword(req, res, next) {
  try {
    const { current, next: nextPw } = req.body || {};
    if (!current || !nextPw) throw new ApiError(400, 'Current and new password are required.');
    if (nextPw.length < 8) throw new ApiError(400, 'Use at least 8 characters.');

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!(await user.comparePassword(current))) {
      throw new ApiError(401, 'Current password is incorrect.');
    }
    user.passwordHash = await User.hashPassword(nextPw);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/me/consent — grant/revoke data-processing consent
// (FR-3, SEC-2). Every transition is audit-logged.
export async function updateConsent(req, res, next) {
  try {
    const granted = !!(req.body?.consentGiven ?? req.body?.granted);
    if (req.user.consentGiven !== granted) {
      req.user.consentGiven = granted;
      req.user.consentLog.push({ action: granted ? 'granted' : 'revoked' });
      await req.user.save();
    }
    res.json(req.user.toClient());
  } catch (err) {
    next(err);
  }
}

// GET/PATCH /api/users/me/settings — preventive-action preferences
// (SDD 8.2: Mute Keywords, Enable Feed Filter, Schedule Nightly Pause).
export async function getSettings(req, res) {
  res.json(req.user.settings.toObject());
}

export async function updateSettings(req, res, next) {
  try {
    const patch = req.body || {};
    const s = req.user.settings;
    if (Array.isArray(patch.muteKeywords)) {
      s.muteKeywords = patch.muteKeywords.map((k) => String(k).toLowerCase().trim()).filter(Boolean);
    }
    if (typeof patch.feedFilter === 'boolean') s.feedFilter = patch.feedFilter;
    if (patch.nightlyPause && typeof patch.nightlyPause === 'object') {
      const np = patch.nightlyPause;
      if (typeof np.enabled === 'boolean') s.nightlyPause.enabled = np.enabled;
      if (typeof np.start === 'string') s.nightlyPause.start = np.start;
      if (typeof np.end === 'string') s.nightlyPause.end = np.end;
    }
    await req.user.save();
    res.json(req.user.settings.toObject());
  } catch (err) {
    next(err);
  }
}

// POST /api/users/me/activity — log a preventive action (e.g. completing
// a 30-min detox, SDD 8.2 "logs against alert").
export async function logActivity(req, res, next) {
  try {
    const action = String(req.body?.action || '').trim();
    if (!action) throw new ApiError(400, 'Activity action is required.');
    req.user.activityLog.push({ action: action.slice(0, 300) });
    await req.user.save();
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ---------------- Authorized Viewer caseload ---------------- */
// SEC-5: viewers see results only for users who authorized them —
// never raw submissions — and cannot submit or modify anything.

async function caseSummary(user) {
  const latest = await AnalysisResult.findOne({ userId: user._id })
    .sort({ analyzedAt: -1 });
  const count = await AnalysisResult.countDocuments({ userId: user._id });
  return {
    id: user._id.toString(),
    name: user.name,
    since: user.createdAt,
    analyses: count,
    lastLevel: latest?.riskLevel || 'Low',
  };
}

// GET /api/users/viewer/cases — accounts that authorized this viewer.
export async function getViewerCases(req, res, next) {
  try {
    const viewer = await User.findById(req.user._id).populate('authorizedCases', 'name createdAt');
    const cases = await Promise.all((viewer.authorizedCases || []).map(caseSummary));
    res.json(cases);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/viewer/cases/:id — read-only detail: latest score/level,
// risk trend and recent results.
export async function getViewerCaseDetail(req, res, next) {
  try {
    const caseId = req.params.id;
    const authorized = (req.user.authorizedCases || []).map((id) => id.toString());
    if (!authorized.includes(caseId)) {
      return res.json(null); // not authorized — client shows "Not authorized"
    }
    const subject = await User.findById(caseId);
    if (!subject) return res.json(null);

    const docs = await AnalysisResult.find({ userId: subject._id })
      .sort({ analyzedAt: -1 })
      .populate('processedTextId')
      .populate('postId');
    const analyses = docs.map(analysisToClient);
    res.json({
      id: subject._id.toString(),
      name: subject.name,
      since: subject.createdAt,
      lastLevel: analyses[0]?.riskLevel || 'Low',
      analyses,
    });
  } catch (err) {
    next(err);
  }
}
