// Dev-only end-to-end verification: spins up an in-memory MongoDB,
// boots the app on a test port, and exercises the full API surface.
// Not part of the deployed service — run with:  node src/e2e.test.mjs
import { MongoMemoryServer } from 'mongodb-memory-server';

const PORT = 5099;
const BASE = `http://localhost:${PORT}/api`;

const results = [];
const check = (name, ok, extra = '') => {
  results.push([name, ok]);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);
};

async function api(path, { method = 'GET', body, token, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method, headers,
    body: form || (body !== undefined ? JSON.stringify(body) : undefined),
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
}

async function main() {
  // Use an external URI when provided (e.g. Atlas test db); otherwise
  // spin up an in-memory MongoDB.
  let mongod = null;
  if (process.env.E2E_MONGODB_URI) {
    process.env.MONGODB_URI = process.env.E2E_MONGODB_URI;
  } else {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri('depalert_test');
  }
  process.env.PORT = String(PORT);
  process.env.JWT_SECRET = 'e2e-test-secret';
  process.env.ML_SERVICE_URL = 'http://localhost:8000';
  process.env.ML_SERVICE_API_KEY = 'depalert_internal_ml_key_7d4f2a9c';

  const { default: app } = await import('./app.js');
  const { connectDB, disconnectDB } = await import('./config/db.js');
  await connectDB();
  const server = app.listen(PORT);

  try {
    // health
    let r = await api('/health');
    check('GET /health', r.status === 200 && r.data.ok);

    // register
    r = await api('/auth/register', { method: 'POST', body: { name: 'Test User', email: 'test@example.com', password: 'password123', consent: true } });
    check('POST /auth/register', r.status === 201 && r.data.token && r.data.user.consentGiven === true);
    const token = r.data.token;

    // duplicate register
    r = await api('/auth/register', { method: 'POST', body: { name: 'Test User', email: 'test@example.com', password: 'password123', consent: true } });
    check('register duplicate email -> 409', r.status === 409);

    // weak password
    r = await api('/auth/register', { method: 'POST', body: { name: 'X', email: 'x@y.com', password: 'short', consent: true } });
    check('register weak password -> 400', r.status === 400);

    // login wrong password / unknown email
    r = await api('/auth/login', { method: 'POST', body: { email: 'test@example.com', password: 'wrong' } });
    check('login wrong password -> 401', r.status === 401);
    r = await api('/auth/login', { method: 'POST', body: { email: 'ghost@example.com', password: 'password123' } });
    check('login unknown email -> 404', r.status === 404);
    r = await api('/auth/login', { method: 'POST', body: { email: 'test@example.com', password: 'password123' } });
    check('login ok', r.status === 200 && r.data.token);

    // auth guard
    r = await api('/analysis/history');
    check('history without token -> 401', r.status === 401);
    r = await api('/analysis/history', { token: 'garbage.token.here' });
    check('history bad token -> 401', r.status === 401);

    // submit text (low risk)
    r = await api('/submissions/text', { method: 'POST', token, body: { text: 'Had a wonderful day with friends, feeling grateful and happy.' } });
    check('submit positive text', r.status === 201 && r.data.analysis.riskLevel === 'Low', `score=${r.data.analysis?.riskScore} level=${r.data.analysis?.riskLevel}`);
    check('no alert on Low', r.data.alert === null);

    // submit text (high risk)
    r = await api('/submissions/text', { method: 'POST', token, body: { text: 'I feel completely hopeless and empty. Nothing ever helps and I am always alone. I never sleep and everything is pointless.' } });
    check('submit negative text -> High + alert', r.status === 201 && r.data.analysis.riskLevel === 'High' && r.data.alert?.status === 'New',
      `score=${r.data.analysis?.riskScore}`);
    const alertId = r.data.alert?.id;

    // empty text rejected
    r = await api('/submissions/text', { method: 'POST', token, body: { text: '   ' } });
    check('empty text -> 400', r.status === 400);

    // latest + history
    r = await api('/analysis/latest', { token });
    check('latest analysis', r.status === 200 && r.data.riskLevel === 'High');
    r = await api('/analysis/history', { token });
    check('history has 2 records', r.status === 200 && r.data.length === 2);
    const analysisId = r.data[0]?.id;
    r = await api(`/analysis/${analysisId}`, { token });
    check('analysis detail', r.status === 200 && r.data.id === analysisId && r.data.markers && Array.isArray(r.data.tokens));

    // alerts
    r = await api('/alerts', { token });
    check('alerts list', r.status === 200 && r.data.length === 1 && r.data[0].status === 'New');
    r = await api(`/alerts/${alertId}`, { method: 'PATCH', token, body: { status: 'Viewed' } });
    check('alert -> Viewed', r.status === 200 && r.data.status === 'Viewed');
    r = await api(`/alerts/${alertId}`, { method: 'PATCH', token, body: { status: 'Bogus' } });
    check('alert bad status -> 400', r.status === 400);

    // trends
    r = await api('/trends', { token });
    check('trends', r.status === 200 && r.data.points.length === 2 && r.data.summary && r.data.rollingAverages);

    // posts + monitor + crisis + settings
    r = await api('/submissions/posts', { token });
    check('posts list', r.status === 200 && r.data.length === 2 && r.data[0].text);
    r = await api('/dashboard/monitor', { token });
    check('monitor feed', r.status === 200 && Array.isArray(r.data));
    r = await api('/dashboard/summary', { token });
    check('dashboard summary', r.status === 200 && r.data.totals.analyses === 2);
    r = await api('/crisis-support', { token });
    check('crisis resources', r.status === 200 && r.data.helplines.length > 0);
    r = await api('/users/me/settings', { token });
    check('get settings', r.status === 200 && Array.isArray(r.data.muteKeywords));
    r = await api('/users/me/settings', { method: 'PATCH', token, body: { feedFilter: true, muteKeywords: ['crypto'] } });
    check('patch settings', r.status === 200 && r.data.feedFilter === true && r.data.muteKeywords.includes('crypto'));

    // CSV upload
    const csv = 'text\n"Great day, feeling happy and loved!"\n"I am so sad and alone, nothing matters anymore."\n\n"Great day, feeling happy and loved!"\n';
    const form = new FormData();
    form.append('file', new Blob([csv], { type: 'text/csv' }), 'posts.csv');
    r = await api('/submissions/csv', { method: 'POST', token, form });
    check('csv upload', r.status === 201 && r.data.results.length === 2 && r.data.skipped >= 2,
      `results=${r.data.results?.length} skipped=${r.data.skipped}`);

    // consent revoke blocks submissions
    r = await api('/users/me/consent', { method: 'PUT', token, body: { consentGiven: false } });
    check('revoke consent', r.status === 200 && r.data.consentGiven === false);
    r = await api('/submissions/text', { method: 'POST', token, body: { text: 'test text here' } });
    check('submit blocked without consent -> 403', r.status === 403);
    await api('/users/me/consent', { method: 'PUT', token, body: { consentGiven: true } });

    // password change + re-login
    r = await api('/users/me/password', { method: 'PATCH', token, body: { current: 'password123', next: 'newpass456' } });
    check('change password', r.status === 200);
    r = await api('/auth/login', { method: 'POST', body: { email: 'test@example.com', password: 'newpass456' } });
    check('login with new password', r.status === 200);

    // viewer role — register a Standard user, then promote to
    // Authorized Viewer directly in the db (registration always creates
    // Standard accounts) and authorize them on the test user.
    r = await api('/auth/register', { method: 'POST', body: { name: 'Viewer One', email: 'viewer@example.com', password: 'password123', consent: true } });
    const viewerToken = r.data.token;
    const viewerId = r.data.user.id;
    r = await api('/users/viewer/cases', { token: viewerToken });
    check('Standard user blocked from viewer routes -> 403', r.status === 403);

    const { default: User } = await import('./models/User.js');
    const testUser = await User.findOne({ email: 'test@example.com' });
    await User.findByIdAndUpdate(viewerId, { role: 'Authorized Viewer', authorizedCases: [testUser._id] });

    r = await api('/users/viewer/cases', { token: viewerToken });
    check('viewer cases list', r.status === 200 && r.data.length === 1 && r.data[0].name === 'Test User');
    const caseId = r.data[0]?.id;
    r = await api(`/users/viewer/cases/${caseId}`, { token: viewerToken });
    check('viewer case detail', r.status === 200 && Array.isArray(r.data.analyses) && r.data.analyses.length >= 2);

    // data isolation: a case the viewer is NOT authorized for -> null
    const other = await User.create({ name: 'Other', email: 'other@example.com', passwordHash: 'x' });
    r = await api(`/users/viewer/cases/${other._id}`, { token: viewerToken });
    check('viewer unauthorized case -> null', r.status === 200 && r.data === null);
  } finally {
    server.close();
    await disconnectDB();
    if (mongod) await mongod.stop();
  }

  const failed = results.filter(([, ok]) => !ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => { console.error('E2E crashed:', err); process.exit(1); });
