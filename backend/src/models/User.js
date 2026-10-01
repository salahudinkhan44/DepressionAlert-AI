// User model (SDD 5.1).
//   name: String
//   email: String (login + notifications)
//   password_hash: String (salted hash, never plaintext — SEC-3)
//   consent_given: Boolean (explicit consent to text analysis — FR-3)
//   role: Enum (Standard, Authorized Viewer)
//   created_at: DateTime
// Plus embedded per-user settings (preventive actions, SDD 8.2), consent
// audit log (SEC-2), authorized viewers (SEC-5) and password-reset fields.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const nightlyPauseSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '23:00' },
    end: { type: String, default: '07:00' },
  },
  { _id: false }
);

const settingsSchema = new Schema(
  {
    muteKeywords: { type: [String], default: [] },
    feedFilter: { type: Boolean, default: false },
    nightlyPause: { type: nightlyPauseSchema, default: () => ({}) },
  },
  { _id: false }
);

const consentEntrySchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    action: { type: String, enum: ['granted', 'revoked'], required: true },
  },
  { _id: false }
);

const activityEntrySchema = new Schema(
  {
    action: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
    },
    passwordHash: { type: String, required: true, select: false }, // salted hash — SEC-3
    consentGiven: { type: Boolean, default: false },
    role: { type: String, enum: ['Standard', 'Authorized Viewer'], default: 'Standard' },

    settings: { type: settingsSchema, default: () => ({}) },
    consentLog: { type: [consentEntrySchema], default: [] },
    activityLog: { type: [activityEntrySchema], default: [] },

    // Users who granted this account read-only access — for
    // role = 'Authorized Viewer' (SDD 5.1 User.role).
    authorizedCases: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },

    // Password-reset support (secure session handling, SEC-7).
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10); // salted one-way hashing — SEC-3
};

// Public shape returned to the client — never leaks passwordHash.
userSchema.methods.toClient = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    consentGiven: this.consentGiven,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
