// Seed script — creates the demo accounts shown on the Login page and a
// realistic analysis history for the demo user so every screen works
// out of the box.
//
//   demo@depalert.ai   / demo1234    (Standard)
//   viewer@depalert.ai / viewer1234  (Authorized Viewer, authorized to
//                                     view the demo user's results)
//
// Run: npm run seed   (idempotent — wipes and re-creates demo data)
import mongoose from 'mongoose';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import Post from './models/Post.js';
import ProcessedText from './models/ProcessedText.js';
import AnalysisResult from './models/AnalysisResult.js';
import BehavioralPattern from './models/BehavioralPattern.js';
import Alert from './models/Alert.js';

const DAY = 86400000;
const ago = (d, h = 0) => new Date(Date.now() - d * DAY - h * 3600000);

// Mirrors frontend/src/data/mockData.js SEED_ANALYSES.
const SEED_ANALYSES = [
  { date: ago(13), riskScore: 24, riskLevel: 'Low', sentiment: 0.42, source: 'Manual', excerpt: 'Had a really good day with friends, grateful for small wins.', markers: { firstPersonDensity: 4.1, absolutistLanguage: 0.8, negativeEmotionWords: 1.2 } },
  { date: ago(12), riskScore: 31, riskLevel: 'Low', sentiment: 0.18, source: 'CSV', excerpt: 'Long week but finally weekend, planning something fun.', markers: { firstPersonDensity: 5.0, absolutistLanguage: 1.0, negativeEmotionWords: 1.6 } },
  { date: ago(10), riskScore: 38, riskLevel: 'Low', sentiment: 0.05, source: 'Manual', excerpt: 'Feeling a bit tired and flat lately, not sure why.', markers: { firstPersonDensity: 6.2, absolutistLanguage: 1.4, negativeEmotionWords: 3.1 } },
  { date: ago(9), riskScore: 46, riskLevel: 'Moderate', sentiment: -0.12, source: 'CSV', excerpt: 'Everything feels heavier than it should. Sleep has been off.', markers: { firstPersonDensity: 7.4, absolutistLanguage: 2.6, negativeEmotionWords: 4.4 } },
  { date: ago(8), riskScore: 44, riskLevel: 'Moderate', sentiment: -0.08, source: 'Manual', excerpt: 'Skipped plans again. I just did not have the energy.', markers: { firstPersonDensity: 6.9, absolutistLanguage: 2.1, negativeEmotionWords: 4.0 } },
  { date: ago(7), riskScore: 52, riskLevel: 'Moderate', sentiment: -0.22, source: 'Manual', excerpt: 'I keep messing everything up and I am tired of trying.', markers: { firstPersonDensity: 8.8, absolutistLanguage: 3.4, negativeEmotionWords: 5.2 } },
  { date: ago(6), riskScore: 49, riskLevel: 'Moderate', sentiment: -0.18, source: 'CSV', excerpt: 'Another sleepless night, mind will not stop racing.', markers: { firstPersonDensity: 7.1, absolutistLanguage: 2.2, negativeEmotionWords: 4.8 } },
  { date: ago(5), riskScore: 58, riskLevel: 'Moderate', sentiment: -0.31, source: 'Manual', excerpt: 'Nobody really notices when I disappear for days anyway.', markers: { firstPersonDensity: 8.2, absolutistLanguage: 4.1, negativeEmotionWords: 5.6 } },
  { date: ago(4), riskScore: 63, riskLevel: 'Moderate', sentiment: -0.36, source: 'Manual', excerpt: 'I feel numb most days. Nothing really matters anymore.', markers: { firstPersonDensity: 9.3, absolutistLanguage: 4.6, negativeEmotionWords: 6.8 } },
  { date: ago(3), riskScore: 71, riskLevel: 'High', sentiment: -0.52, source: 'CSV', excerpt: 'Everything is always pointless and I never feel okay anymore.', markers: { firstPersonDensity: 10.4, absolutistLanguage: 5.8, negativeEmotionWords: 8.1 } },
  { date: ago(2), riskScore: 66, riskLevel: 'Moderate', sentiment: -0.41, source: 'Manual', excerpt: 'Trying to keep it together but I am exhausted and alone.', markers: { firstPersonDensity: 9.7, absolutistLanguage: 4.2, negativeEmotionWords: 6.4 } },
  { date: ago(0, 5), riskScore: 74, riskLevel: 'High', sentiment: -0.58, source: 'Manual', excerpt: 'I feel completely hopeless and nothing I do ever helps.', markers: { firstPersonDensity: 11.2, absolutistLanguage: 6.3, negativeEmotionWords: 9.0 } },
];

const ALERT_MESSAGES = {
  viewed: 'High concentration of negative sentiment detected in your recent submission. Your wellness matters — consider a short break or reaching out.',
  fresh: 'Elevated depression-related language patterns detected. We recommend reviewing crisis-support resources and talking to someone you trust.',
};

async function seed() {
  await connectDB();
  console.log('[seed] clearing demo data…');

  const demoEmail = 'demo@depalert.ai';
  const viewerEmail = 'viewer@depalert.ai';
  const existing = await User.find({ email: { $in: [demoEmail, viewerEmail] } }).select('_id');
  const ids = existing.map((u) => u._id);
  await Promise.all([
    Post.deleteMany({ userId: { $in: ids } }),
    ProcessedText.deleteMany({ userId: { $in: ids } }),
    AnalysisResult.deleteMany({ userId: { $in: ids } }),
    BehavioralPattern.deleteMany({ userId: { $in: ids } }),
    Alert.deleteMany({ userId: { $in: ids } }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);

  const demo = await User.create({
    name: 'Demo User',
    email: demoEmail,
    passwordHash: await User.hashPassword('demo1234'),
    role: 'Standard',
    consentGiven: true,
    consentLog: [{ action: 'granted', at: ago(40) }],
    settings: {
      muteKeywords: ['crypto', 'spoiler'],
      feedFilter: true,
      nightlyPause: { enabled: false, start: '23:00', end: '07:00' },
    },
    createdAt: ago(40),
  });

  const viewer = await User.create({
    name: 'Dr. Ayesha Rahman',
    email: viewerEmail,
    passwordHash: await User.hashPassword('viewer1234'),
    role: 'Authorized Viewer',
    consentGiven: true,
    consentLog: [{ action: 'granted', at: ago(60) }],
    authorizedCases: [demo._id], // demo user authorized this viewer (SEC-5)
    createdAt: ago(60),
  });

  // Persist Post -> ProcessedText -> AnalysisResult per seed entry.
  const analyses = [];
  for (const s of SEED_ANALYSES) {
    const post = await Post.create({
      userId: demo._id, content: s.excerpt, source: s.source,
      platform: s.source === 'CSV' ? 'CSV Upload' : 'Manual Entry',
      submittedAt: s.date,
    });
    const processed = await ProcessedText.create({
      postId: post._id, userId: demo._id,
      cleanedText: s.excerpt.toLowerCase(),
      tokens: s.excerpt.toLowerCase().split(/\s+/),
      sentimentScore: s.sentiment,
      markers: s.markers,
      processedAt: s.date,
    });
    analyses.push(await AnalysisResult.create({
      processedTextId: processed._id, postId: post._id, userId: demo._id,
      riskScore: s.riskScore, riskLevel: s.riskLevel,
      modelVersion: 'seed-v1.0.0', analyzedAt: s.date,
    }));
  }

  // Rolling BehavioralPattern across the seeded markers (SDD 6.5).
  const n = SEED_ANALYSES.length;
  const avg = (k) => +(SEED_ANALYSES.reduce((s, a) => s + a.markers[k], 0) / n).toFixed(2);
  await BehavioralPattern.create({
    userId: demo._id,
    windowStart: SEED_ANALYSES[0].date,
    windowEnd: SEED_ANALYSES[n - 1].date,
    firstPersonDensity: avg('firstPersonDensity'),
    absolutistLanguage: avg('absolutistLanguage'),
    negativeEmotionWords: avg('negativeEmotionWords'),
    analysisCount: n,
  });

  // Alerts for the two High results (FR-11): one Viewed, one New.
  const high = analyses.filter((a) => a.riskLevel === 'High');
  await Alert.create({
    analysisResultId: high[0]._id, userId: demo._id,
    message: ALERT_MESSAGES.viewed, status: 'Viewed', createdAt: high[0].analyzedAt,
  });
  await Alert.create({
    analysisResultId: high[1]._id, userId: demo._id,
    message: ALERT_MESSAGES.fresh, status: 'New', createdAt: high[1].analyzedAt,
  });

  console.log(`[seed] demo user: ${demoEmail} / demo1234 (${demo._id})`);
  console.log(`[seed] viewer:    ${viewerEmail} / viewer1234 (${viewer._id}) — authorized on demo user`);
  console.log(`[seed] ${n} analyses, ${high.length} alerts, 1 behavioral pattern created.`);
}

seed()
  .then(() => disconnectDB())
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('[seed] failed:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
