// Response serializers — translate MongoDB documents into the JSON
// shapes the React frontend consumes (field names mirror mockData.js).

// AnalysisResult joined with its Post + ProcessedText.
export function analysisToClient(doc) {
  const pt = doc.processedTextId || {};
  const post = doc.postId || {};
  return {
    id: doc._id.toString(),
    postId: (post._id || doc.postId).toString(),
    date: doc.analyzedAt,
    riskScore: doc.riskScore,
    riskLevel: doc.riskLevel,
    sentiment: pt.sentimentScore ?? null,
    source: post.source || null,
    excerpt: (post.content || '').slice(0, 140),
    cleanedText: pt.cleanedText || '',
    tokens: pt.tokens || [],
    markers: pt.markers || { firstPersonDensity: 0, absolutistLanguage: 0, negativeEmotionWords: 0 },
    indicators: pt.indicators || [],
    modelVersion: doc.modelVersion,
  };
}

export function alertToClient(doc) {
  return {
    id: doc._id.toString(),
    analysisId: doc.analysisResultId.toString(),
    createdAt: doc.createdAt,
    status: doc.status,
    message: doc.message,
  };
}
