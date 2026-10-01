// Post model (SDD 5.1).
//   user_id: FK -> User
//   content: Text (raw submitted text)
//   source: Enum (Manual, CSV)
//   submitted_at: DateTime
// kind/platform carry the Post & Comment Deep Dive grouping used by the
// Daily Log UI (SDD 8.1.2) — feed posts vs direct messages.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true },
    source: { type: String, enum: ['Manual', 'CSV'], required: true },
    kind: { type: String, enum: ['feed', 'dm'], default: 'feed' },
    platform: { type: String, default: 'Manual Entry', trim: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// SEC-5: all queries are scoped by userId.
postSchema.index({ userId: 1, submittedAt: -1 });
// FR-6: supports duplicate detection per user.
postSchema.index({ userId: 1, content: 1 });

postSchema.methods.toClient = function () {
  return {
    id: this._id.toString(),
    kind: this.kind,
    platform: this.platform,
    date: this.submittedAt,
    text: this.content,
  };
};

export default mongoose.model('Post', postSchema);
