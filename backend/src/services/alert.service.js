// Alert service — Alert System Module.
// evaluateAndGenerateAlert() (SDD 6.4): when an AnalysisResult's risk
// level is High (score >= HIGH_RISK_THRESHOLD), create an Alert
// (status New) and surface it to the user via in-app notification.
import Alert from '../models/Alert.js';
import { config } from '../config/env.js';

const ALERT_MESSAGE =
  'Elevated depression-related language patterns detected in your latest submission. ' +
  'Your wellbeing matters — consider the crisis-support resources or talking to someone you trust.';

// Returns the created Alert document, or null when the result does not
// cross the high-risk threshold (SDD 6.3/6.4).
export async function evaluateAndGenerateAlert(analysisResult, userId) {
  if (analysisResult.riskLevel !== 'High' ||
      analysisResult.riskScore < config.highRiskThreshold) {
    return null;
  }
  const alert = await Alert.create({
    analysisResultId: analysisResult._id,
    userId,
    message: ALERT_MESSAGE,
    status: 'New',
    channel: 'InAppAlert', // Notification -> InAppAlert (SDD 4.1)
  });
  return alert;
}
