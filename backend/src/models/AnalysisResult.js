// AnalysisResult model (SDD 5.1).
//   processed_text_id: FK -> ProcessedText
//   risk_score: Float (0-100)
//   risk_level: Enum (Low, Moderate, High)  // >=70 High, >=40 Moderate
//   model_version: String (ML model version, for traceability)
//   analyzed_at: DateTime
import mongoose from 'mongoose';

const { Schema } = mongoose;

const analysisResultSchema = new Schema(
  {
    processedTextId: { type: Schema.Types.ObjectId, ref: 'ProcessedText', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // SEC-5
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
    modelVersion: { type: String, required: true },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

analysisResultSchema.index({ userId: 1, analyzedAt: -1 });

export default mongoose.model('AnalysisResult', analysisResultSchema);
