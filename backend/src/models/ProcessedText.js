// ProcessedText model (SDD 5.1).
//   post_id: FK -> Post
//   cleaned_text: Text (after stop-word removal and symbol cleaning)
//   tokens: Array<String>
//   sentiment_score: Float (-1 to 1)
// Also stores the extracted feature vector and linguistic markers produced
// by extractFeatures() (SDD 6.2) so analysis results are traceable.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const markersSchema = new Schema(
  {
    firstPersonDensity: { type: Number, default: 0 },
    absolutistLanguage: { type: Number, default: 0 },
    negativeEmotionWords: { type: Number, default: 0 },
  },
  { _id: false }
);

const processedTextSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // SEC-5
    cleanedText: { type: String, default: '' },
    tokens: { type: [String], default: [] },
    sentimentScore: { type: Number, min: -1, max: 1, default: 0 },
    markers: { type: markersSchema, default: () => ({}) },
    indicators: { type: [String], default: [] },
    featureVector: { type: [Number], default: [] },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model('ProcessedText', processedTextSchema);
