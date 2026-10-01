// ML service client.
// Calls the protected internal Python NLP/ML service (SRS 6.2) at
// ML_SERVICE_URL with ML_SERVICE_API_KEY. Sends submitted text and
// receives cleaned text, tokens, sentiment score, feature data and the
// depression risk score / risk level.
import { config } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.middleware.js';

const TIMEOUT_MS = 15000; // PER-1 target is <5s; leave headroom for the HTTP hop

async function callMlService(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${config.mlServiceUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.mlServiceApiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new ApiError(
        502,
        detail.detail || detail.message || 'Analysis service rejected the request.'
      );
    }
    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // UC-4 exception path: analysis failure -> retryable error.
    throw new ApiError(
      502,
      'Analysis service is unavailable — please retry in a moment.'
    );
  } finally {
    clearTimeout(timer);
  }
}

// preprocessText + computeRiskScore for a single post.
// Returns { cleanedText, tokens, sentimentScore, markers, indicators,
//           featureVector, riskScore, riskLevel, modelVersion }
export function analyzeText(text) {
  return callMlService('/analyze', { text });
}

// Batch variant for CSV uploads — one HTTP call per file, not per row.
// Returns { results: [...], modelVersion }
export function analyzeBatch(texts) {
  return callMlService('/analyze/batch', { texts });
}

export async function mlServiceHealth() {
  try {
    const res = await fetch(`${config.mlServiceUrl}/health`, {
      headers: { 'X-API-Key': config.mlServiceApiKey },
      signal: AbortSignal.timeout(4000),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
