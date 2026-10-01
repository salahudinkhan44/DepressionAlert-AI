// Analysis controller.
// Latest result (UC-5), history list (UC-6), single result detail.
// Users only ever see their own records (SEC-5).
import AnalysisResult from '../models/AnalysisResult.js';
import { analysisToClient } from '../utils/serializers.js';

const POPULATE = [
  { path: 'processedTextId' },
  { path: 'postId' },
];

// GET /api/analysis/latest — latest risk score + risk level (UC-5).
// Returns null when the user has no analyses yet (client prompts UC-4).
export async function getLatest(req, res, next) {
  try {
    const doc = await AnalysisResult.findOne({ userId: req.user._id })
      .sort({ analyzedAt: -1 })
      .populate(POPULATE);
    res.json(doc ? analysisToClient(doc) : null);
  } catch (err) {
    next(err);
  }
}

// GET /api/analysis/history — all results by date, newest first (UC-6,
// FR-14).
export async function getHistory(req, res, next) {
  try {
    const docs = await AnalysisResult.find({ userId: req.user._id })
      .sort({ analyzedAt: -1 })
      .populate(POPULATE);
    res.json(docs.map(analysisToClient));
  } catch (err) {
    next(err);
  }
}

// GET /api/analysis/:id — single result detail. Returns null when the
// record does not belong to the requester (SEC-5).
export async function getById(req, res, next) {
  try {
    const doc = await AnalysisResult.findOne({ _id: req.params.id, userId: req.user._id })
      .populate(POPULATE);
    res.json(doc ? analysisToClient(doc) : null);
  } catch (err) {
    next(err);
  }
}
