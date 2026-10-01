// CSV upload middleware.
// Multipart handling + validation of format, size, malformed and unsafe
// content (FR-5, SEC-6). Files land in CSV_UPLOAD_DIR temporarily and are
// discarded once rows are persisted as Post records (SDD 5).
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { config } from '../config/env.js';

const uploadDir = path.resolve(process.cwd(), config.csvUploadDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = `csv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.csv`;
    cb(null, safe);
  },
});

function fileFilter(req, file, cb) {
  const isCsvExt = /\.csv$/i.test(file.originalname);
  const isCsvMime = ['text/csv', 'application/vnd.ms-excel', 'text/plain', 'application/octet-stream']
    .includes(file.mimetype);
  if (!isCsvExt || !isCsvMime) {
    return cb(new Error('Only .csv files are accepted.'));
  }
  cb(null, true);
}

export const csvUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxCsvFileSizeMb * 1024 * 1024, files: 1 },
}).single('file');

// Best-effort cleanup of a temporary upload — CSVs are never retained
// after their rows are persisted (SDD 5).
export function discardUpload(file) {
  if (!file?.path) return;
  fs.promises.unlink(file.path).catch(() => {});
}
