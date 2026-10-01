// Mock NLP/ML analyzer — frontend stand-in for the Python service
// (SRS §6.2). Produces the same shape the real backend will return:
// cleaned text, tokens, sentiment score, linguistic markers, a 0-100
// depression risk score and a Low/Moderate/High level (SDD §5.1, §6.3).
import { riskLevel } from './format';

const NEGATIVE = [
  'sad', 'hopeless', 'empty', 'alone', 'lonely', 'tired', 'numb', 'worthless',
  'cry', 'crying', 'broken', 'anxious', 'dark', 'depressed', 'depression',
  'miserable', 'exhausted', 'pointless', 'hate', 'hurt', 'pain', 'guilt',
  'failure', 'failed', 'useless', 'burden', 'sleep', 'insomnia', 'void',
  'overwhelmed', 'stress', 'stressed', 'scared', 'afraid', 'lost', 'give up',
];
const POSITIVE = [
  'happy', 'grateful', 'good', 'great', 'love', 'excited', 'hopeful', 'calm',
  'better', 'proud', 'fun', 'joy', 'thankful', 'smile', 'win', 'amazing',
];
const ABSOLUTIST = [
  'always', 'never', 'nothing', 'everything', 'everyone', 'nobody', 'no one',
  'completely', 'totally', 'forever', 'entirely', 'everyone', 'all',
];
const FIRST_PERSON = ['i', 'me', 'my', 'mine', 'myself', "i'm", 'im', "i've", "i'll"];

function tokenize(text) {
  return text.toLowerCase().replace(/https?:\/\/\S+|[^\w\s']/g, ' ').split(/\s+/).filter(Boolean);
}

function countMatches(tokens, vocab) {
  const joined = ` ${tokens.join(' ')} `;
  return vocab.reduce((n, w) => {
    if (w.includes(' ') || w.includes("'")) {
      return n + joined.split(` ${w} `).length - 1;
    }
    return n + tokens.filter((t) => t === w).length;
  }, 0);
}

export function analyzeText(rawText) {
  const tokens = tokenize(rawText);
  const total = Math.max(tokens.length, 1);

  const neg = countMatches(tokens, NEGATIVE);
  const pos = countMatches(tokens, POSITIVE);
  const abs = countMatches(tokens, ABSOLUTIST);
  const fp = countMatches(tokens, FIRST_PERSON);

  const negRatio = neg / total;
  const absRatio = abs / total;
  const fpRatio = fp / total;

  // Deterministic mock scoring approximating the real classifier output.
  let score = 18 + negRatio * 340 + absRatio * 160 + Math.max(0, fpRatio - 0.04) * 160 - (pos / total) * 140;
  score = Math.max(4, Math.min(98, Math.round(score)));

  const sentiment = Math.max(-1, Math.min(1, +(((pos - neg) / Math.max(pos + neg, 1)) * 0.9 + (score < 40 ? 0.15 : -0.15)).toFixed(2)));

  const markers = {
    firstPersonDensity: +((fp / total) * 100).toFixed(1),
    absolutistLanguage: +((abs / total) * 100).toFixed(1),
    negativeEmotionWords: +((neg / total) * 100).toFixed(1),
  };

  const indicators = [];
  if (markers.negativeEmotionWords >= 4) indicators.push('Elevated negative-emotion vocabulary');
  if (markers.absolutistLanguage >= 3) indicators.push('Absolutist language detected');
  if (markers.firstPersonDensity >= 6) indicators.push('High self-referential (first-person) focus');
  if (neg > 0 && pos === 0) indicators.push('No positive-affect terms present');
  if (indicators.length === 0) indicators.push('No strong depressive linguistic markers detected');

  return {
    cleanedText: tokens.join(' '),
    tokens,
    sentimentScore: sentiment,
    riskScore: score,
    riskLevel: riskLevel(score),
    markers,
    indicators,
    modelVersion: 'mock-v1.0.0',
  };
}

// Parse CSV text -> array of post strings (first column or a `text` column).
export function parseCsvPosts(csvText) {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headerCells = lines[0].toLowerCase().split(',');
  const looksLikeHeader = headerCells.some((c) => /text|post|content|message/.test(c));
  const rows = looksLikeHeader ? lines.slice(1) : lines;
  return rows
    .map((line) => {
      const firstComma = line.indexOf(',');
      const cell = firstComma === -1 ? line : line.slice(0, firstComma);
      return cell.replace(/^"|"$/g, '').trim();
    })
    .filter(Boolean);
}
