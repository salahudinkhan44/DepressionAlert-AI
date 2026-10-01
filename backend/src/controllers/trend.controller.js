// Trend controller — Behavioral Analysis Module output.
// Returns BehavioralPattern history + comparisons for UC-7 / FR-10.
import AnalysisResult from '../models/AnalysisResult.js';
import BehavioralPattern from '../models/BehavioralPattern.js';
import { analysisToClient } from '../utils/serializers.js';

// GET /api/trends — changes in risk score, sentiment and emotional
// patterns across previous analyses, oldest -> newest.
export async function getTrends(req, res, next) {
  try {
    const docs = await AnalysisResult.find({ userId: req.user._id })
      .sort({ analyzedAt: 1 })
      .populate([{ path: 'processedTextId' }, { path: 'postId' }]);

    const items = docs.map(analysisToClient);
    const points = items.map((a) => ({
      date: a.date, score: a.riskScore, sentiment: a.sentiment, level: a.riskLevel,
    }));
    const markers = items.map((a) => ({ date: a.date, ...a.markers }));

    const first = items[0];
    const last = items[items.length - 1];
    const pattern = await BehavioralPattern.findOne({ userId: req.user._id }).lean();

    res.json({
      points,
      markers,
      rollingAverages: pattern ? {
        firstPersonDensity: pattern.firstPersonDensity,
        absolutistLanguage: pattern.absolutistLanguage,
        negativeEmotionWords: pattern.negativeEmotionWords,
        windowStart: pattern.windowStart,
        windowEnd: pattern.windowEnd,
        analysisCount: pattern.analysisCount,
      } : null,
      summary: first && last ? {
        delta: last.riskScore - first.riskScore,
        first: first.riskScore,
        last: last.riskScore,
        count: items.length,
        highDays: items.filter((a) => a.riskLevel === 'High').length,
      } : null,
    });
  } catch (err) {
    next(err);
  }
}
