// Crisis-support resources served by GET /api/crisis-support
// (UC-8, FR-12; SDD 8.1.4): helplines, emergency contacts, calming
// exercises and educational resources.
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
