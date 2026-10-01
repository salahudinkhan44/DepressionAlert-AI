"""Python NLP/ML service entry point.

Protected internal API called only by the Node.js backend (SRS 6.2).
Performs: text cleaning/preprocessing, tokenization, sentiment analysis,
emotional + linguistic feature extraction, behavioral-pattern analysis,
depression-risk score generation and risk-level classification.

Run:  uvicorn app.main:app --port 8000
Auth: every request must send  X-API-Key: <ML_SERVICE_API_KEY>
"""
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .behavioral.pattern_analyzer import rolling_averages
from .config import ML_SERVICE_API_KEY, MODEL_VERSION
from .detection.model_loader import model_available
from .detection.risk_scorer import compute_risk_score
from .features.linguistic_features import extract_features
from .features.sentiment import compute_sentiment
from .preprocessing.text_cleaner import clean_text
from .preprocessing.tokenizer import remove_stop_words, tokenize

app = FastAPI(title="DepressionAlert AI - NLP/ML service", version=MODEL_VERSION)


# ---------- auth: protected internal API (SRS 6.2) ----------

async def require_api_key(x_api_key: str = Header(default="")) -> None:
    if x_api_key != ML_SERVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid service API key.")


# ---------- schemas ----------

class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)


class BatchRequest(BaseModel):
    texts: list[str] = Field(min_length=1, max_length=500)


class PatternsRequest(BaseModel):
    markers: list[dict]


# ---------- pipeline ----------

def analyze_one(raw_text: str) -> dict:
    """Full NLP chain for one submission (SDD 6.2 + 6.3):
    preprocessText -> extractFeatures -> computeRiskScore."""
    cleaned = clean_text(raw_text)
    raw_tokens = tokenize(cleaned)
    tokens = remove_stop_words(raw_tokens)
    analysis_tokens = raw_tokens or tokens  # features count full tokens

    # First pass with a neutral risk hint, then rescore with the real one
    # so sentiment polarity can reflect the final score.
    provisional = compute_sentiment(analysis_tokens, cleaned, 50.0)
    markers, vector, indicators = extract_features(analysis_tokens, cleaned, provisional)
    risk_score, risk_level, model_version, explanation = compute_risk_score(
        vector, cleaned_text=cleaned, markers=markers
    )
    sentiment = compute_sentiment(analysis_tokens, cleaned, risk_score)
    if explanation:
        indicators.append(explanation)

    return {
        "cleanedText": cleaned,
        "tokens": tokens,
        "sentimentScore": sentiment,
        "markers": {
            "firstPersonDensity": markers["first_person_density"],
            "absolutistLanguage": markers["absolutist_language"],
            "negativeEmotionWords": markers["negative_emotion_words"],
        },
        "indicators": indicators,
        "featureVector": vector,
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "modelVersion": model_version,
    }


# ---------- endpoints ----------

@app.get("/health")
async def health():
    return {
        "ok": True,
        "service": "depressionalert-ai-ml",
        "model_version": MODEL_VERSION,
        "model_loaded": model_available(),
    }


@app.post("/analyze", dependencies=[Depends(require_api_key)])
async def analyze(req: AnalyzeRequest):
    return analyze_one(req.text)


@app.post("/analyze/batch", dependencies=[Depends(require_api_key)])
async def analyze_batch(req: BatchRequest):
    results = [analyze_one(t) for t in req.texts if t and t.strip()]
    return {"results": results, "modelVersion": MODEL_VERSION}


@app.post("/patterns/rolling", dependencies=[Depends(require_api_key)])
async def patterns_rolling(req: PatternsRequest):
    return rolling_averages(req.markers)
