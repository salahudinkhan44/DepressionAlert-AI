// Submission controller — Data Collection Module.
// validateAndStorePost() (SDD 6.1): verify consent (middleware), accept
// manual text or parsed CSV rows, reject empty/malformed/duplicate
// records, persist Post records, then trigger the NLP -> risk-score ->
// alert pipeline.
import fs from 'node:fs';
import Post from '../models/Post.js';
import { ApiError } from '../middleware/errorHandler.middleware.js';
import { discardUpload } from '../middleware/upload.middleware.js';
import { extractPostTexts } from '../utils/csvValidator.js';
import { analyzeBatch } from '../services/mlService.service.js';
import { evaluateAndGenerateAlert } from '../services/alert.service.js';
import { updateBehavioralPattern } from '../services/behavioralAnalysis.service.js';
import {
  runTextPipeline, validateAndStorePost, processAndScore,
  toClientAnalysis, alertToClient,
} from '../services/pipeline.service.js';

// POST /api/submissions/text — manual paste (FR-4).
// Returns { analysis, alert } — alert is null unless High risk (SDD 6.4).
export async function submitText(req, res, next) {
  try {
    const text = String(req.body?.text || '');
    const meta = {
      kind: req.body?.kind === 'dm' ? 'dm' : 'feed',
      platform: req.body?.platform,
    };
    const { analysis, alert } = await runTextPipeline(req.user, text, meta);
    res.status(201).json({
      analysis: await toClientAnalysis(analysis),
      alert: alert ? alertToClient(alert) : null,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/submissions/csv — CSV batch upload (FR-5, SEC-6).
// The raw file is temporary and discarded once rows are persisted (SDD 5).
// Returns { results, skipped, alert } — acknowledged quickly (PER-3).
export async function submitCsv(req, res, next) {
  const file = req.file;
  try {
    if (!file) throw new ApiError(400, 'Choose a CSV file first.');

    const csvText = await fs.promises.readFile(file.path, 'utf8');

    // Skip rows already submitted by this user (FR-6 duplicate check).
    const existing = await Post.find({ userId: req.user._id }).select('content').lean();
    const existingTexts = new Set(existing.map((p) => p.content.toLowerCase()));
    const { posts: texts, skipped } = extractPostTexts(csvText, existingTexts);

    if (!texts.length) {
      throw new ApiError(400, 'No valid post text found in this CSV file.');
    }

    // One internal call to the ML service for the whole batch (SRS 6.2).
    const batch = await analyzeBatch(texts);
    const mlResults = batch.results || [];
    if (mlResults.length !== texts.length) {
      throw new ApiError(502, 'Analysis service returned an incomplete batch — please retry.');
    }

    const results = [];
    let latestAlert = null;
    for (let i = 0; i < texts.length; i += 1) {
      const post = await validateAndStorePost(req.user._id, texts[i], 'CSV', {
        platform: 'CSV Upload',
      });
      const analysis = await processAndScore(post, mlResults[i]);
      await updateBehavioralPattern(req.user._id, mlResults[i].markers, analysis.analyzedAt);
      const alert = await evaluateAndGenerateAlert(analysis, req.user._id);
      results.push(await toClientAnalysis(analysis));
      if (alert) latestAlert = alert;
    }

    res.status(201).json({
      results,
      skipped,
      alert: latestAlert ? alertToClient(latestAlert) : null,
    });
  } catch (err) {
    next(err);
  } finally {
    discardUpload(file); // CSVs are never retained (SDD 5, SEC-6)
  }
}

// GET /api/submissions/posts — the user's stored posts for the Post &
// Comment Deep Dive panel (SDD 8.1.2).
export async function getPosts(req, res, next) {
  try {
    const posts = await Post.find({ userId: req.user._id }).sort({ submittedAt: -1 }).limit(50);
    res.json(posts.map((p) => p.toClient()));
  } catch (err) {
    next(err);
  }
}
