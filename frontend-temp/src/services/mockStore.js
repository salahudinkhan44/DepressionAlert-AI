// In-memory mock database for the frontend demo, persisted to
// localStorage so demo state survives reloads. Phase 2/3 replaces this
// with the real Express + MongoDB backend — api.js is the only file
// that needs to change.
import {
  DEMO_USERS, SEED_ANALYSES, SEED_ALERTS, SEED_POSTS,
  SEED_MONITOR, CRISIS_RESOURCES, VIEWER_CASES,
} from '../data/mockData';

const KEY = 'depalert_store_v1';

function seed() {
  return {
    users: DEMO_USERS.map(({ password, ...u }) => u),
    analyses: [...SEED_ANALYSES],
    alerts: [...SEED_ALERTS],
    posts: [...SEED_POSTS],
    monitor: [...SEED_MONITOR],
    settings: {
      muteKeywords: ['crypto', 'spoiler'],
      feedFilter: true,
      nightlyPause: { enabled: false, start: '23:00', end: '07:00' },
    },
    consentLog: [{ at: SEED_ANALYSES[0].date, action: 'granted' }],
    activity: [],
    counter: 100,
  };
}

let db;
try {
  db = JSON.parse(localStorage.getItem(KEY)) || seed();
} catch {
  db = seed();
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage unavailable */ }
}

export const store = {
  get db() { return db; },
  nextId(prefix) { db.counter += 1; persist(); return `${prefix}-${db.counter}`; },
  save: persist,
  reset() { db = seed(); persist(); },
};

export { CRISIS_RESOURCES, VIEWER_CASES };
