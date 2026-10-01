// Centralized environment-variable loading/validation.
// See backend/.env.example for the full variable list.
import dotenv from 'dotenv';

dotenv.config();

const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: num(process.env.PORT, 5000),

  // Allowed frontend origin (CORS)
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // MongoDB connection string (local or Atlas free tier) — Phase 3.
  // The real cluster URL is provided via the .env file; it is never committed.
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/depressionalert_ai',

  // JWT session tokens (Proposal 7.1, SRS SEC-4/SEC-7)
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',

  // Protected internal Python NLP/ML service (SRS 6.2)
  mlServiceUrl: (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, ''),
  mlServiceApiKey: process.env.ML_SERVICE_API_KEY || 'dev-ml-service-key',

  // High-risk alert threshold on the 0-100 risk score (SDD 6.3: >= 70 = High)
  highRiskThreshold: num(process.env.HIGH_RISK_THRESHOLD, 70),

  // CSV upload handling (FR-5, SEC-6) — raw files are temporary and
  // discarded after Post records are persisted (SDD 5).
  maxCsvFileSizeMb: num(process.env.MAX_CSV_FILE_SIZE_MB, 5),
  csvUploadDir: process.env.CSV_UPLOAD_DIR || 'uploads',
};

// Warn (don't crash) when insecure defaults are used outside development.
if (config.nodeEnv === 'production') {
  if (config.jwtSecret === 'dev-only-insecure-secret-change-me') {
    console.warn('[env] WARNING: JWT_SECRET is not set — set a long random secret in production.');
  }
  if (!process.env.MONGODB_URI) {
    console.warn('[env] WARNING: MONGODB_URI is not set — falling back to localhost.');
  }
}
