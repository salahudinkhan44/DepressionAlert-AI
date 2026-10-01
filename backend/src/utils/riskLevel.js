// Risk-level mapping.
// SDD 6.3: risk_score >= 70 -> High, >= 40 -> Moderate, else Low.
// Threshold values come from env config (HIGH_RISK_THRESHOLD).
import { config } from '../config/env.js';

export function riskLevel(score) {
  if (score >= config.highRiskThreshold) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}
