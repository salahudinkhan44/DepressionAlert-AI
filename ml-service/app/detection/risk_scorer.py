"""Depression risk scoring.

computeRiskScore() (SDD 6.3): -> risk_score (0-100);
risk_level High >= 70, Moderate >= 40, else Low (FR-9).

Scoring order:
  1. Groq LLM (GROQ_API_KEY configured) — contextual classifier,
     predict -> risk_score via strict JSON.
  2. Trained scikit-learn artifact (predict_proba * 100) if present.
  3. Deterministic lexicon-based heuristic — keeps the pipeline
     functional without an external model.
"""
from .groq_scorer import groq_available, score_with_groq
from .model_loader import load_model
from ..config import MODEL_VERSION

HIGH_RISK_THRESHOLD = 70
MODERATE_RISK_THRESHOLD = 40


def classify(risk_score: float) -> str:
    if risk_score >= HIGH_RISK_THRESHOLD:
        return "High"
    if risk_score >= MODERATE_RISK_THRESHOLD:
        return "Moderate"
    return "Low"


def _heuristic_score(feature_vector: list[float]) -> float:
    """Deterministic stand-in approximating classifier output — driven
    by the same markers the trained model consumes."""
    _, neg_ratio, abs_ratio, fp_ratio, pos_ratio, _ = feature_vector
    score = (
        18
        + neg_ratio * 340
        + abs_ratio * 160
        + max(0.0, fp_ratio - 0.04) * 160
        - pos_ratio * 140
    )
    return float(max(4, min(98, round(score))))


def compute_risk_score(
    feature_vector: list[float],
    cleaned_text: str = "",
    markers: dict | None = None,
) -> tuple[float, str, str, str]:
    """Return (risk_score 0-100, risk_level, model_version, explanation)."""
    # 1) Groq LLM — primary scorer when configured.
    if groq_available() and cleaned_text:
        try:
            score, level, explanation, version = score_with_groq(
                cleaned_text, markers or {}
            )
            return score, level, version, explanation
        except Exception:
            pass  # degrade gracefully to local scoring

    # 2) Trained scikit-learn artifact.
    model = load_model()
    if model is not None:
        proba = model.predict_proba([feature_vector])[0]
        score = float(proba[-1]) * 100.0
        return round(score, 1), classify(score), MODEL_VERSION, ""

    # 3) Heuristic fallback.
    score = _heuristic_score(feature_vector)
    return round(score, 1), classify(score), f"heuristic-{MODEL_VERSION}", ""
