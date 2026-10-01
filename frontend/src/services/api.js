// Frontend API layer — real REST client for the Express backend
// (SRS §6.2). Function names, arguments and return shapes are unchanged
// from the Phase-1 mock, so page/component code works as-is.
//
//   POST /api/auth/register | login | logout | forgot-password | reset-password
//   GET/PATCH /api/users/me  PATCH /api/users/me/password
//   PUT /api/users/me/consent  POST /api/users/me/activity
//   GET/PATCH /api/users/me/settings
//   GET /api/users/viewer/cases | /viewer/cases/:id   (Authorized Viewer)
//   POST /api/submissions/text | /csv  GET /api/submissions/posts
//   GET /api/analysis/latest | /history | /:id
//   GET /api/trends
//   GET /api/alerts  PATCH /api/alerts/:id
//   GET /api/crisis-support
//   GET /api/dashboard/monitor | /summary
import { riskLevel } from '../utils/format';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'depalert_token';
const USER_KEY = 'depalert_user';

/* ---------------- session helpers ---------------- */

export function getSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  if (!token || !raw) return null;
  try { return { token, user: JSON.parse(raw) }; } catch { return null; }
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function updateStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Core request helper — attaches the JWT, parses JSON, and throws
// Error(message) using the server's error text on failure.
async function request(path, { method = 'GET', body, formData } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: formData || (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new Error('Cannot reach the server — check your connection and try again.');
  }

  let data = null;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) {
    // SEC-7: expired/invalid tokens end the session client-side too.
    if (res.status === 401 && token) clearSession();
    throw new Error(data?.message || `Request failed (${res.status}). Please try again.`);
  }
  return data;
}

/* ---------------- auth (FR-1, FR-2, SEC-4/7) ---------------- */

export async function login(email, password) {
  const { token, user } = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  saveSession(token, user);
  return { token, user };
}

export async function register({ name, email, password, consent }) {
  const { token, user } = await request('/auth/register', {
    method: 'POST',
    body: { name, email, password, consent },
  });
  saveSession(token, user);
  return { token, user };
}

export async function logout() {
  try { await request('/auth/logout', { method: 'POST' }); } catch { /* best effort */ }
  clearSession();
}

export async function requestPasswordReset(email) {
  if (!email) throw new Error('Please enter your email address.');
  return request('/auth/forgot-password', { method: 'POST', body: { email } });
}

export async function resetPassword(token, password) {
  return request('/auth/reset-password', { method: 'POST', body: { token, password } });
}

/* ---------------- profile & consent (FR-3, SEC-2) ---------------- */

export async function updateProfile(patch) {
  const user = await request('/users/me', { method: 'PATCH', body: patch });
  updateStoredUser(user);
  return user;
}

export async function changePassword(current, next) {
  return request('/users/me/password', { method: 'PATCH', body: { current, next } });
}

export async function updateConsent(granted) {
  const user = await request('/users/me/consent', { method: 'PUT', body: { consentGiven: granted } });
  updateStoredUser(user);
  return user;
}

/* ---------------- submissions -> analysis pipeline ---------------- */
/* validateAndStorePost -> preprocessText -> computeRiskScore ->
   evaluateAndGenerateAlert (SDD §6.1–6.4), on the server.            */

export async function submitText(text) {
  return request('/submissions/text', { method: 'POST', body: { text } });
}

export async function submitCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('/submissions/csv', { method: 'POST', formData });
}

/* ---------------- retrieval (FR-9..FR-14) ---------------- */

export async function getAnalyses() {
  return request('/analysis/history');
}

export async function getAnalysisById(id) {
  return request(`/analysis/${id}`);
}

export async function getLatestAnalysis() {
  return request('/analysis/latest');
}

export async function getTrends() {
  return request('/trends');
}

export async function getAlerts() {
  return request('/alerts');
}

export async function updateAlertStatus(id, status) {
  return request(`/alerts/${id}`, { method: 'PATCH', body: { status } });
}

export async function getPosts() {
  return request('/submissions/posts');
}

export async function getMonitorFeed() {
  return request('/dashboard/monitor');
}

export async function getCrisisResources() {
  return request('/crisis-support');
}

/* ---------------- settings (SDD §8.2 preventive actions) ---------------- */

export async function getSettings() {
  return request('/users/me/settings');
}

export async function updateSettings(patch) {
  return request('/users/me/settings', { method: 'PATCH', body: patch });
}

export async function logActivity(action) {
  try {
    await request('/users/me/activity', { method: 'POST', body: { action } });
  } catch { /* logging is best-effort */ }
}

/* ---------------- Authorized Viewer role (SDD §5.1 User.role) ---------------- */

export async function getAuthorizedCases() {
  return request('/users/viewer/cases');
}

export async function getCaseDetail(id) {
  return request(`/users/viewer/cases/${id}`);
}

export { riskLevel };
