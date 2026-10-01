// Seed data for the frontend demo — stands in for MongoDB documents
// (SDD §5.1) until Phase 2/3 wiring. Field names mirror the data
// dictionary so the shapes survive the backend swap.

const DAY = 86400000;
const ago = (d, h = 0) => new Date(Date.now() - d * DAY - h * 3600000).toISOString();

export const DEMO_USERS = [
  {
    id: 'u-demo', name: 'Demo User', email: 'demo@depalert.ai', password: 'demo1234',
    role: 'Standard', consentGiven: true, createdAt: ago(40),
  },
  {
    id: 'u-viewer', name: 'Dr. Ayesha Rahman', email: 'viewer@depalert.ai', password: 'viewer1234',
    role: 'Authorized Viewer', consentGiven: true, createdAt: ago(60),
  },
];

// Accounts an Authorized Viewer is permitted to see (read-only).
export const VIEWER_CASES = [
  { id: 'u-demo', name: 'Demo User', since: ago(21), analyses: 12, lastLevel: 'Moderate' },
  { id: 'c-102', name: 'Case #102', since: ago(14), analyses: 6, lastLevel: 'High' },
  { id: 'c-207', name: 'Case #207', since: ago(33), analyses: 18, lastLevel: 'Low' },
];

export const SEED_ANALYSES = [
  { id: 'a-01', date: ago(13), riskScore: 24, riskLevel: 'Low', sentiment: 0.42, source: 'Manual', excerpt: 'Had a really good day with friends, grateful for small wins.', markers: { firstPersonDensity: 4.1, absolutistLanguage: 0.8, negativeEmotionWords: 1.2 } },
  { id: 'a-02', date: ago(12), riskScore: 31, riskLevel: 'Low', sentiment: 0.18, source: 'CSV', excerpt: 'Long week but finally weekend, planning something fun.', markers: { firstPersonDensity: 5.0, absolutistLanguage: 1.0, negativeEmotionWords: 1.6 } },
  { id: 'a-03', date: ago(10), riskScore: 38, riskLevel: 'Low', sentiment: 0.05, source: 'Manual', excerpt: 'Feeling a bit tired and flat lately, not sure why.', markers: { firstPersonDensity: 6.2, absolutistLanguage: 1.4, negativeEmotionWords: 3.1 } },
  { id: 'a-04', date: ago(9), riskScore: 46, riskLevel: 'Moderate', sentiment: -0.12, source: 'CSV', excerpt: 'Everything feels heavier than it should. Sleep has been off.', markers: { firstPersonDensity: 7.4, absolutistLanguage: 2.6, negativeEmotionWords: 4.4 } },
  { id: 'a-05', date: ago(8), riskScore: 44, riskLevel: 'Moderate', sentiment: -0.08, source: 'Manual', excerpt: 'Skipped plans again. I just did not have the energy.', markers: { firstPersonDensity: 6.9, absolutistLanguage: 2.1, negativeEmotionWords: 4.0 } },
  { id: 'a-06', date: ago(7), riskScore: 52, riskLevel: 'Moderate', sentiment: -0.22, source: 'Manual', excerpt: 'I keep messing everything up and I am tired of trying.', markers: { firstPersonDensity: 8.8, absolutistLanguage: 3.4, negativeEmotionWords: 5.2 } },
  { id: 'a-07', date: ago(6), riskScore: 49, riskLevel: 'Moderate', sentiment: -0.18, source: 'CSV', excerpt: 'Another sleepless night, mind will not stop racing.', markers: { firstPersonDensity: 7.1, absolutistLanguage: 2.2, negativeEmotionWords: 4.8 } },
  { id: 'a-08', date: ago(5), riskScore: 58, riskLevel: 'Moderate', sentiment: -0.31, source: 'Manual', excerpt: 'Nobody really notices when I disappear for days anyway.', markers: { firstPersonDensity: 8.2, absolutistLanguage: 4.1, negativeEmotionWords: 5.6 } },
  { id: 'a-09', date: ago(4), riskScore: 63, riskLevel: 'Moderate', sentiment: -0.36, source: 'Manual', excerpt: 'I feel numb most days. Nothing really matters anymore.', markers: { firstPersonDensity: 9.3, absolutistLanguage: 4.6, negativeEmotionWords: 6.8 } },
  { id: 'a-10', date: ago(3), riskScore: 71, riskLevel: 'High', sentiment: -0.52, source: 'CSV', excerpt: 'Everything is always pointless and I never feel okay anymore.', markers: { firstPersonDensity: 10.4, absolutistLanguage: 5.8, negativeEmotionWords: 8.1 } },
  { id: 'a-11', date: ago(2), riskScore: 66, riskLevel: 'Moderate', sentiment: -0.41, source: 'Manual', excerpt: 'Trying to keep it together but I am exhausted and alone.', markers: { firstPersonDensity: 9.7, absolutistLanguage: 4.2, negativeEmotionWords: 6.4 } },
  { id: 'a-12', date: ago(0, 5), riskScore: 74, riskLevel: 'High', sentiment: -0.58, source: 'Manual', excerpt: 'I feel completely hopeless and nothing I do ever helps.', markers: { firstPersonDensity: 11.2, absolutistLanguage: 6.3, negativeEmotionWords: 9.0 } },
];

export const SEED_ALERTS = [
  {
    id: 'al-01', analysisId: 'a-10', createdAt: ago(3), status: 'Viewed',
    message: 'High concentration of negative sentiment detected in your recent submission. Your wellness matters — consider a short break or reaching out.',
  },
  {
    id: 'al-02', analysisId: 'a-12', createdAt: ago(0, 5), status: 'New',
    message: 'Elevated depression-related language patterns detected. We recommend reviewing crisis-support resources and talking to someone you trust.',
  },
];

// Posts shown in the Post & Comment Deep Dive panel (SDD 8.1.2).
export const SEED_POSTS = [
  { id: 'p-1', kind: 'feed', platform: 'Twitter/X', date: ago(1, 3), text: 'I am always tired and nothing ever feels worth it anymore.' },
  { id: 'p-2', kind: 'feed', platform: 'Instagram', date: ago(2, 6), text: 'Another night staring at the ceiling. Sleep never comes easy these days.' },
  { id: 'p-3', kind: 'feed', platform: 'Twitter/X', date: ago(4, 2), text: 'Everyone seems happy except me. I feel completely invisible.' },
  { id: 'p-4', kind: 'feed', platform: 'Facebook', date: ago(6, 8), text: 'Pushed through the week. Small win: cooked a real meal today.' },
  { id: 'p-5', kind: 'dm', platform: 'Direct Message', date: ago(1, 9), text: 'Honestly I have been crying a lot and I do not know why. Everything feels pointless.' },
  { id: 'p-6', kind: 'dm', platform: 'Direct Message', date: ago(3, 4), text: 'Sorry I keep cancelling. I never have the energy to see anyone.' },
  { id: 'p-7', kind: 'dm', platform: 'Direct Message', date: ago(5, 7), text: 'Thanks for checking in. Today was actually a little better.' },
];

// Live sentiment monitor feed for the Dashboard (SDD 8.1.1).
export const SEED_MONITOR = [
  { id: 'm-1', icon: 'warning', tone: 'high', text: 'Spike in negative-emotion vocabulary detected in the last 24h.', time: ago(0, 4) },
  { id: 'm-2', icon: 'chart', tone: 'moderate', text: 'Posting frequency down 35% vs your 14-day baseline.', time: ago(0, 9) },
  { id: 'm-3', icon: 'moon', tone: 'moderate', text: 'Late-night activity pattern observed between 1–3 AM.', time: ago(1, 2) },
  { id: 'm-4', icon: 'spark', tone: 'low', text: 'Positive-affect terms increased in your most recent post.', time: ago(1, 7) },
  { id: 'm-5', icon: 'info', tone: 'low', text: 'First-person pronoun density stable across recent posts.', time: ago(2, 1) },
];

// Crisis-support resources (SRS FR-12, SDD 8.1.4).
export const CRISIS_RESOURCES = {
  helplines: [
    { id: 'h-1', name: 'Umang Pakistan Helpline', contact: '0311-7786264', detail: 'Free, confidential emotional support — 24/7.' },
    { id: 'h-2', name: 'Rozan Counseling Helpline', contact: '0304-111-1741', detail: 'Psychosocial support and counseling referrals.' },
    { id: 'h-3', name: 'Emergency Services', contact: '1122', detail: 'Immediate danger or medical emergency.' },
    { id: 'h-4', name: 'International: findahelpline.com', contact: 'findahelpline.com', detail: 'Directory of verified helplines by country.' },
  ],
  toolkit: [
    { id: 't-1', title: 'Breathing Exercises', desc: 'A 2-minute guided box-breathing session to calm your nervous system.', action: 'START SESSION', icon: 'wind', tone: 'teal', kind: 'breathing' },
    { id: 't-2', title: 'Guided Meditation', desc: 'Short audio sessions for grounding and self-compassion.', action: 'OPEN', icon: 'headphones', tone: 'indigo', kind: 'media' },
    { id: 't-3', title: 'Mood-Boosting Audio', desc: 'A curated playlist designed to gently lift your mood.', action: 'OPEN PLAYLIST', icon: 'music', tone: 'amber', kind: 'media' },
  ],
  articles: [
    { id: 'ar-1', title: 'What your words reveal about your mood', category: 'Sentiment Tracking', readTime: '4 min', body: 'Language carries measurable signals of emotional state. Research in computational linguistics shows that patterns like first-person pronoun density, absolutist phrasing ("always", "never") and negative-emotion vocabulary correlate with depressive symptoms. DepressionAlert AI tracks these markers over time so changes surface early — not to diagnose you, but to help you notice shifts worth discussing with a professional.' },
    { id: 'ar-2', title: 'How AI supports (not replaces) mental-health care', category: 'AI in Mental Health', readTime: '5 min', body: 'AI tools analyze text for statistical patterns — they cannot diagnose, and they are not a substitute for a clinician. Used responsibly, they act as an early-warning layer: flagging changes in your expression between appointments and prompting timely check-ins. Every result here is advisory, and all clinical decisions belong to qualified professionals.' },
    { id: 'ar-3', title: 'Understanding your risk score', category: 'Sentiment Tracking', readTime: '3 min', body: 'Your risk score (0–100) combines sentiment polarity with linguistic markers extracted from text you chose to submit. Scores below 40 are Low, 40–69 Moderate, and 70+ High — a High score triggers a supportive alert and crisis resources. One score is a snapshot; the trend over time is what matters.' },
    { id: 'ar-4', title: 'Grounding techniques for difficult moments', category: 'Coping Skills', readTime: '4 min', body: 'When distress spikes, grounding helps: try box breathing (inhale 4s, hold 4s, exhale 4s, hold 4s), the 5-4-3-2-1 senses exercise, or a short walk without your phone. If feelings persist or worsen, please reach out to a helpline or mental-health professional — support is a strength, not a weakness.' },
  ],
};

export const FAQS = [
  { q: 'What does DepressionAlert AI do?', a: 'It analyzes social-media text you choose to submit — by pasting text or uploading a CSV — and produces a depression-risk score (0–100), a risk level (Low/Moderate/High), and linguistic markers. When a score crosses the high-risk threshold it shows an alert with crisis-support resources.' },
  { q: 'Is this a medical diagnosis?', a: 'No. The system provides supportive early-awareness insight only. It is not a diagnostic or clinical tool, and all outputs are advisory. Always consult a qualified mental-health professional for assessment.' },
  { q: 'Is my data collected automatically?', a: 'Never. The system is strictly permission-based: nothing is collected automatically and analysis begins only after you grant data-processing consent. You can revoke consent anytime from the Privacy & Profile page.' },
  { q: 'What CSV format should I upload?', a: 'A .csv file with one post per row — either a single column of text or a column named text/content/post. Empty, malformed and duplicate rows are rejected before analysis (FR-6).' },
  { q: 'How is the risk score calculated?', a: 'A trained machine-learning classifier scores sentiment and linguistic features of your text. Scores of 70+ are High, 40–69 Moderate, and below 40 Low (SDD §6.3).' },
  { q: 'Who can see my data?', a: 'Only you — and any viewer you explicitly authorize (e.g., a counselor). All analysis data is tied to your account and isolated per user (SEC-5).' },
  { q: 'What happens when a high-risk alert appears?', a: 'You will see a calm, non-alarming notification plus crisis helplines, coping exercises and educational resources. You can take a short break or dismiss the alert.' },
];

// Dashboard "mood impact by platform" breakdown (SDD 8.1.1).
export const PLATFORM_MOOD = [
  { name: 'Twitter/X', value: 38, color: '#0d9488' },
  { name: 'Instagram', value: 27, color: '#4f46e5' },
  { name: 'Facebook', value: 21, color: '#f59e0b' },
  { name: 'Direct Msgs', value: 14, color: '#94a3b8' },
];

// 7-day usage-time vs mood-score correlation (SDD 8.1.1).
export const WEEK_IMPACT = [
  { day: 'Mon', usage: 3.2, mood: 62 },
  { day: 'Tue', usage: 4.1, mood: 55 },
  { day: 'Wed', usage: 2.4, mood: 68 },
  { day: 'Thu', usage: 5.3, mood: 44 },
  { day: 'Fri', usage: 4.6, mood: 49 },
  { day: 'Sat', usage: 2.0, mood: 71 },
  { day: 'Sun', usage: 3.5, mood: 58 },
];
