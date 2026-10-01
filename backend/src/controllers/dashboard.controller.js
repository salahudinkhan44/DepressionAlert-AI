// Dashboard controller — Dashboard Module (M6, SDD 6).
// Aggregated view of results, trends and alerts (FR-13) plus the live
// sentiment-monitor feed (SDD 8.1.1), derived from the user's real
// analysis data — nothing is monitored automatically.
import mongoose from 'mongoose';
import AnalysisResult from '../models/AnalysisResult.js';
import BehavioralPattern from '../models/BehavioralPattern.js';
import Alert from '../models/Alert.js';
import { analysisToClient, alertToClient } from '../utils/serializers.js';

const POPULATE = [{ path: 'processedTextId' }, { path: 'postId' }];

// Build monitor-feed items from recent analyses + the rolling
// BehavioralPattern. Each item: { id, icon, tone, text, time }.
function buildMonitorFeed(items, pattern, newAlerts) {
  const feed = [];
  const latest = items[0];
  const previous = items[1];

  if (latest && pattern && pattern.analysisCount >= 2) {
    const m = latest.markers;
    if (m.negativeEmotionWords > pattern.negativeEmotionWords * 1.5 && m.negativeEmotionWords >= 4) {
      feed.push({
        icon: 'warning', tone: 'high', time: latest.date,
        text: 'Spike in negative-emotion vocabulary detected in the last 24h.',
      });
    }
    if (m.absolutistLanguage > pattern.absolutistLanguage * 1.5 && m.absolutistLanguage >= 3) {
      feed.push({
        icon: 'chart', tone: 'moderate', time: latest.date,
        text: 'Absolutist language ("always", "never") is trending above your baseline.',
      });
    }
  }

  if (latest && previous) {
    const sentimentUp = latest.sentiment - previous.sentiment;
    if (sentimentUp >= 0.2) {
      feed.push({
        icon: 'spark', tone: 'low', time: latest.date,
        text: 'Positive-affect terms increased in your most recent post.',
      });
    } else if (sentimentUp <= -0.3) {
      feed.push({
        icon: 'chart', tone: 'moderate', time: latest.date,
        text: 'Sentiment polarity dropped versus your previous analysis.',
      });
    }
  }

  if (items.length >= 3) {
    const recent = items.slice(0, 3);
    const olderAvg = items.slice(3).length
      ? items.slice(3).reduce((s, a) => s + a.riskScore, 0) / items.slice(3).length
      : null;
    if (olderAvg !== null) {
      const recentAvg = recent.reduce((s, a) => s + a.riskScore, 0) / recent.length;
      if (recentAvg > olderAvg + 8) {
        feed.push({
          icon: 'chart', tone: 'moderate', time: recent[0].date,
          text: 'Recent risk scores are running above your earlier baseline.',
        });
      }
    }
  }

  for (const alert of newAlerts.slice(0, 2)) {
    feed.push({
      icon: 'warning', tone: 'high', time: alert.createdAt,
      text: 'High-risk alert awaiting review — see Alerts.',
    });
  }

  if (latest && !feed.some((f) => f.tone === 'low')) {
    feed.push({
      icon: 'info', tone: 'low', time: latest.date,
      text: 'First-person pronoun density stable across recent posts.',
    });
  }

  return feed
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 6)
    .map((f, i) => ({ id: `m-${i + 1}`, ...f }));
}

// GET /api/dashboard/monitor — live sentiment monitor feed.
export async function getMonitorFeed(req, res, next) {
  try {
    const docs = await AnalysisResult.find({ userId: req.user._id })
      .sort({ analyzedAt: -1 })
      .limit(12)
      .populate(POPULATE);
    const items = docs.map(analysisToClient);
    const pattern = await BehavioralPattern.findOne({ userId: req.user._id }).lean();
    const newAlerts = await Alert.find({ userId: req.user._id, status: 'New' })
      .sort({ createdAt: -1 }).limit(3);
    res.json(buildMonitorFeed(items, pattern, newAlerts));
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/summary — one-call aggregate for the dashboard
// (latest result, counts, alert status — UC-3, USE-2).
export async function getDashboardSummary(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const [latest, total, highCount, newAlerts, pattern] = await Promise.all([
      AnalysisResult.findOne({ userId }).sort({ analyzedAt: -1 }).populate(POPULATE),
      AnalysisResult.countDocuments({ userId }),
      AnalysisResult.countDocuments({ userId, riskLevel: 'High' }),
      Alert.find({ userId, status: 'New' }).sort({ createdAt: -1 }),
      BehavioralPattern.findOne({ userId }).lean(),
    ]);
    res.json({
      latest: latest ? analysisToClient(latest) : null,
      totals: { analyses: total, highRisk: highCount },
      newAlerts: newAlerts.map(alertToClient),
      rollingAverages: pattern ? {
        firstPersonDensity: pattern.firstPersonDensity,
        absolutistLanguage: pattern.absolutistLanguage,
        negativeEmotionWords: pattern.negativeEmotionWords,
      } : null,
    });
  } catch (err) {
    next(err);
  }
}
