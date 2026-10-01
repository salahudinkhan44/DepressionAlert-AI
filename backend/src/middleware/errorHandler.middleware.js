// Central error handler.
// Consistent JSON error responses; analysis failures surface a retryable
// error to the client (UC-4 exceptions).

// Throw an ApiError anywhere in the pipeline to produce a clean JSON
// error response with the given HTTP status.
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Multer errors (file too large, unexpected field, etc.) — SEC-6.
  if (err.name === 'MulterError') {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'CSV file is too large.'
      : `Upload failed: ${err.message}`;
    return res.status(400).json({ message: msg });
  }
  // Mongoose validation / bad ObjectId.
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return res.status(400).json({ message: first?.message || 'Validation failed.' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'This email is already registered. Try logging in.' });
  }

  const status = err.status || 500;
  const body = { message: err.message || 'Something went wrong. Please try again.' };
  if (err.details) body.details = err.details;
  if (status >= 500) console.error('[error]', err);
  return res.status(status).json(body);
}
