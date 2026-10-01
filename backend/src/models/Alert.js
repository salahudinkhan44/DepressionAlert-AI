// Alert model (SDD 5.1).
//   analysis_result_id: FK -> AnalysisResult (triggering result)
//   message: String (e.g., high concentration of negative sentiment)
//   status: Enum (New, Viewed, Dismissed)
//   created_at: DateTime
// Notification hierarchy: base Notification -> InAppAlert / EmailAlert
// (EmailAlert optional per SDD 4.1). The in-app alert is this document;
// channel is recorded for traceability.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const alertSchema = new Schema(
  {
    analysisResultId: { type: Schema.Types.ObjectId, ref: 'AnalysisResult', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // SEC-5
    message: { type: String, required: true },
    status: { type: String, enum: ['New', 'Viewed', 'Dismissed'], default: 'New' },
    channel: { type: String, enum: ['InAppAlert', 'EmailAlert'], default: 'InAppAlert' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

alertSchema.index({ userId: 1, createdAt: -1 });

alertSchema.methods.toClient = function () {
  return {
    id: this._id.toString(),
    analysisId: this.analysisResultId.toString(),
    createdAt: this.createdAt,
    status: this.status,
    message: this.message,
  };
};

export default mongoose.model('Alert', alertSchema);
