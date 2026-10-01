// CSV validation helpers.
// Parses uploaded CSV rows and flags empty, malformed, invalid or
// duplicate records before processing (FR-6, SEC-6; SDD 6.1).
import { ApiError } from '../middleware/errorHandler.middleware.js';

const MAX_CELL_CHARS = 5000; // unsafe/oversized content guard (SEC-6)
const HEADER_PATTERN = /^(text|post|content|message|body|comment)s?$/i;

// Minimal RFC-4180-style CSV parser: handles quoted cells, embedded
// commas/newlines and escaped quotes. Returns an array of row objects
// (arrays of cell strings).
export function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const ch = csvText[i];
    if (inQuotes) {
      if (ch === '"') {
        if (csvText[i + 1] === '"') { cell += '"'; i += 1; }
        else inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell); cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && csvText[i + 1] === '\n') i += 1;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// Pick the post-text column: a named header (text/post/content/message)
// if present, otherwise the first column.
function pickTextCells(rows) {
  const header = rows[0].map((c) => c.trim());
  const headerIdx = header.findIndex((c) => HEADER_PATTERN.test(c));
  const hasHeader = headerIdx >= 0;
  const col = hasHeader ? headerIdx : 0;
  const dataRows = hasHeader ? rows.slice(1) : rows;
  return dataRows.map((r) => (r[col] ?? '').trim());
}

// Extract candidate post strings from CSV content, classifying skipped
// rows. Returns { posts: string[], skipped: number }.
// - empty rows are skipped
// - oversized cells are rejected as unsafe (SEC-6)
// - duplicates are skipped (within the file AND vs existingTexts)
export function extractPostTexts(csvText, existingTexts = new Set()) {
  const rows = parseCsv(csvText);
  if (!rows.length) throw new ApiError(400, 'The CSV file appears to be empty.');

  const cells = pickTextCells(rows);
  const seen = new Set(existingTexts);
  const posts = [];
  let skipped = 0;

  for (const cell of cells) {
    if (!cell) { skipped += 1; continue; }                        // empty row
    if (cell.length > MAX_CELL_CHARS) { skipped += 1; continue; } // unsafe content
    const key = cell.toLowerCase();
    if (seen.has(key)) { skipped += 1; continue; }                // duplicate
    seen.add(key);
    posts.push(cell);
  }
  return { posts, skipped };
}
