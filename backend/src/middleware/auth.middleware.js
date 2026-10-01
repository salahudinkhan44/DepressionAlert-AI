// Auth middleware.
// Verifies the JWT session token on protected routes and attaches the
// user; rejects expired/invalid tokens (SEC-4, SEC-7).
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/User.js';
import { ApiError } from './errorHandler.middleware.js';

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }
    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch {
      // Expired/invalid tokens are rejected — SEC-7.
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, 'Account not found. Please log in again.');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Restrict a route to specific roles (e.g. 'Authorized Viewer').
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You are not authorized to access this resource.'));
    }
    next();
  };
}
