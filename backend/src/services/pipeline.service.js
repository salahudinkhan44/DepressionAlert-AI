// Analysis pipeline orchestration — wires the six core modules together
// (SDD 3.2 / DFD):
//   validateAndStorePost (M1) -> preprocessText via ML service (M2) ->
//   computeRiskScore (M3) -> updateBehavioralPattern (M4) ->
//   evaluateAndGenerateAlert (M5)
// Consent (FR-3) is enforced upstream by middleware — SDD 6.1.
import Post from '../models/Post.js';
import ProcessedText from '../models/ProcessedText.js';
import AnalysisResult from '../models/AnalysisResult.js';
import { ApiError } from '../middleware/errorHandler.middleware.js';
import { analyzeText } from './mlService.service.js';
import { evaluateAndGenerateAlert } from './alert.service.js';
import { updateBehavioralPattern } from './behavioralAnalysis.service.js';
import { analysisToClient, alertToClient } from '../utils/serializers.js';

// M1 — Data Collection Module (SDD 6.1): validate input and persist a
// Post record. Manual submissions reject empty text; CSV rows are
// pre-filtered by csvValidator (empty/malformed/duplicate).
export async function validateAndStorePost(userId, rawInput, sourceType, meta = {}) {
  const content = (rawInput || '').trim();
  if (!content) throw new ApiError(400, 'Please enter some text to analyze.');
  if (content.length > 5000) {
    throw new ApiError(400, 'Text is too long — please keep submissions under 5,000 characters.');
  }
  return Post.create({
    userId,
    content,
    source: sourceType, // 'Manual' | 'CSV'
    kind: meta.kind || 'feed',
    platform: meta.platform || (sourceType === 'CSV' ? 'CSV Upload' : 'Manual Entry'),
    submittedAt: new Date(),
  });
}

// M2 + M3 — NLP Processing + Depression Detection: send the post text to
// the protected Python service, persist ProcessedText (D2) and the
// AnalysisResult (D3) with model_version traceability.
export async function processAndScore(post, mlResult) {
  const processed = await ProcessedText.create({
    postId: post._id,
    userId: post.userId,
    cleanedText: mlResult.cleanedText,
    tokens: mlResult.tokens,
    sentimentScore: mlResult.sentimentScore,
    markers: mlResult.markers,
    indicators: mlResult.indicators,
    featureVector: mlResult.featureVector,
  });

  return AnalysisResult.create({
    processedTextId: processed._id,
    postId: post._id,
    userId: post.userId,
    riskScore: mlResult.riskScore,
    riskLevel: mlResult.riskLevel,
    modelVersion: mlResult.modelVersion,
    analyzedAt: new Date(),
  });
}

// Full single-text pipeline: Post -> ML -> ProcessedText ->
// AnalysisResult -> BehavioralPattern -> Alert (if High).
// Returns { analysis, alert } in client shape.
export async function runTextPipeline(user, rawText, meta = {}) {
  const post = await validateAndStorePost(user._id, rawText, 'Manual', meta);
  const mlResult = await analyzeText(post.content);
  const analysis = await processAndScore(post, mlResult);
  await updateBehavioralPattern(user._id, mlResult.markers, analysis.analyzedAt); // M4
  const alert = await evaluateAndGenerateAlert(analysis, user._id);               // M5
  return { analysis, alert };
}

// Populate refs and emit the client-facing analysis shape.
export async function toClientAnalysis(analysisDoc) {
  const doc = await AnalysisResult.findById(analysisDoc._id)
    .populate('processedTextId')
    .populate('postId');
  return analysisToClient(doc);
}

export { analysisToClient, alertToClient };
