// Auth controller.
// register (FR-1), login + JWT session (FR-2, SEC-4), logout (SEC-7).
// Passwords hashed with a one-way algorithm (SEC-3, bcryptjs).
import crypto from 'node:crypto';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorHandler.middleware.js';
import { signToken } from '../middleware/auth.middleware.js';
import { config } from '../config/env.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// UC-1: name+email+password -> validate -> create -> session.
export async function register(req, res, next) {
  try {
    const { name, email, password, consent } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      throw new ApiError(400, 'Name, email and password are required.');
    }
    if (name.trim().length < 2) throw new ApiError(400, 'Please enter your full name.');
    if (!EMAIL_RE.test(email)) throw new ApiError(400, 'Enter a valid email address.');
    if (password.length < 8) throw new ApiError(400, 'Use at least 8 characters.');

    const normalized = email.toLowerCase().trim();
    if (await User.findOne({ email: normalized })) {
      throw new ApiError(409, 'This email is already registered. Try logging in.');
    }

    const user = await User.create({
      name: name.trim(),
      email: normalized,
      passwordHash: await User.hashPassword(password),
      consentGiven: !!consent,
      consentLog: consent ? [{ action: 'granted' }] : [],
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toClient() });
  } catch (err) {
    next(err);
  }
}

// UC-2: email+password -> JWT session.
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash');
    if (!user) {
      throw new ApiError(404, 'No account found for this email. Please register first.');
    }
    const ok = await user.comparePassword(password);
    if (!ok) throw new ApiError(401, 'Incorrect password. Please try again.');

    const token = signToken(user);
    res.json({ token, user: user.toClient() });
  } catch (err) {
    next(err);
  }
}

// JWTs are stateless — logout is a client-side token discard; the
// endpoint exists so the client can log the event (SEC-7).
export async function logout(req, res) {
  res.json({ ok: true });
}

// Request a password reset. A real deployment emails the token; since no
// email service is in the FYP stack, the raw token is returned only in
// non-production so the flow stays testable end-to-end.
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email?.trim()) throw new ApiError(400, 'Please enter your email address.');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      const raw = crypto.randomBytes(32).toString('hex');
      user.resetTokenHash = crypto.createHash('sha256').update(raw).digest('hex');
      user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      await user.save();
      if (config.nodeEnv !== 'production') {
        return res.json({ ok: true, resetToken: raw });
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) throw new ApiError(400, 'Reset token and new password are required.');
    if (password.length < 8) throw new ApiError(400, 'Use at least 8 characters.');

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetTokenHash: hash,
      resetTokenExpiresAt: { $gt: new Date() },
    }).select('+resetTokenHash +resetTokenExpiresAt +passwordHash');
    if (!user) throw new ApiError(400, 'Reset link is invalid or has expired.');

    user.passwordHash = await User.hashPassword(password);
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
