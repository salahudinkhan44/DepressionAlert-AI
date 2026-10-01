// BehavioralPattern model (SDD 5.1).
//   user_id: FK -> User
//   window_start / window_end: DateTime (aggregation window)
//   first_person_density: Float (avg first-person pronoun usage)
//   absolutist_language: Float (avg absolutist-word usage)
//   negative_emotion_words: Float (avg negative-emotion word frequency)
// One rolling-average document per user, updated by
// updateBehavioralPattern() after every analysis (SDD 6.5).
import mongoose from 'mongoose';

const { Schema } = mongoose;

const behavioralPatternSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
    firstPersonDensity: { type: Number, default: 0 },
    absolutistLanguage: { type: Number, default: 0 },
    negativeEmotionWords: { type: Number, default: 0 },
    analysisCount: { type: Number, default: 0 },
  },
  { timestamps: { updatedAt: 'updatedAt' } }
);

export default mongoose.model('BehavioralPattern', behavioralPatternSchema);
