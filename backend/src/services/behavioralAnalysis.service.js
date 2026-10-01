// Behavioral analysis service.
// updateBehavioralPattern() (SDD 6.5): maintains per-user rolling
// averages of first-person pronoun density, absolutist language and
// negative-emotion word frequency for the Sentiment Volatility timeline.
import BehavioralPattern from '../models/BehavioralPattern.js';

// Fold one processed text's markers into the user's rolling average.
// windowStart = first analysis, windowEnd = most recent analysis.
export async function updateBehavioralPattern(userId, markers, analyzedAt = new Date()) {
  const existing = await BehavioralPattern.findOne({ userId });
  const n = existing ? existing.analysisCount : 0;

  const roll = (prev, next) => +(((prev * n) + next) / (n + 1)).toFixed(2);

  if (!existing) {
    return BehavioralPattern.create({
      userId,
      windowStart: analyzedAt,
      windowEnd: analyzedAt,
      firstPersonDensity: markers.firstPersonDensity ?? 0,
      absolutistLanguage: markers.absolutistLanguage ?? 0,
      negativeEmotionWords: markers.negativeEmotionWords ?? 0,
      analysisCount: 1,
    });
  }

  existing.firstPersonDensity = roll(existing.firstPersonDensity, markers.firstPersonDensity ?? 0);
  existing.absolutistLanguage = roll(existing.absolutistLanguage, markers.absolutistLanguage ?? 0);
  existing.negativeEmotionWords = roll(existing.negativeEmotionWords, markers.negativeEmotionWords ?? 0);
  existing.windowEnd = analyzedAt;
  existing.analysisCount = n + 1;
  return existing.save();
}
