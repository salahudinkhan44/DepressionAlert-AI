// Alert controller — Alert System Module.
// evaluateAndGenerateAlert() (SDD 6.4) runs in the analysis pipeline;
// this controller serves alert lists and status transitions
// (New -> Viewed -> Dismissed).
import Alert from '../models/Alert.js';
import { ApiError } from '../middleware/errorHandler.middleware.js';
import { alertToClient } from '../utils/serializers.js';

const VALID_STATUS = ['New', 'Viewed', 'Dismissed'];

// GET /api/alerts — the user's alerts, newest first (UC-8, FR-11).
export async function getAlerts(req, res, next) {
  try {
    const alerts = await Alert.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts.map(alertToClient));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/alerts/:id — update status (New -> Viewed | Dismissed).
// Alerts are strictly scoped to the owning user (SEC-5).
export async function updateAlertStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!VALID_STATUS.includes(status)) {
      throw new ApiError(400, 'Status must be New, Viewed or Dismissed.');
    }
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!alert) throw new ApiError(404, 'Alert not found.');
    res.json(alertToClient(alert));
  } catch (err) {
    next(err);
  }
}
