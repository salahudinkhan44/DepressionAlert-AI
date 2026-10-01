"""Groq LLM risk scorer.

When GROQ_API_KEY is configured, the depression-risk score is produced
by a Groq-hosted LLM (OpenAI-compatible chat API). The model receives
the cleaned text plus the extracted linguistic markers and returns
strict JSON: {"risk_score": 0-100, "risk_level": ..., "explanation": ...}.

Falls back to raising an exception on any failure — the caller decides
whether to degrade to the local scorer.
"""
import json

import requests

from ..config import GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL

_SYSTEM_PROMPT = (
    "You are a mental-health text classifier for an early-awareness "
    "support tool (not a diagnostic device). Analyze the submitted "
    "social-media text and return STRICT JSON only: "
    '{"risk_score": <0-100>, "risk_level": "Low"|"Moderate"|"High", '
    '"explanation": "<one sentence>"}. '
    "Bands: >=70 High, 40-69 Moderate, <40 Low. "
    "Weigh depression-related signals: negative-emotion vocabulary, "
    "absolutist phrasing, self-referential focus, hopelessness."
)


def groq_available() -> bool:
    return bool(GROQ_API_KEY)


def score_with_groq(cleaned_text: str, markers: dict) -> tuple[float, str, str, str]:
    """Return (risk_score, risk_level, explanation, model_version)."""
    user_msg = (
        f"Text: {cleaned_text}\n\n"
        f"Linguistic markers (% of tokens): "
        f"first-person density={markers['first_person_density']}, "
        f"absolutist language={markers['absolutist_language']}, "
        f"negative-emotion words={markers['negative_emotion_words']}"
    )
    resp = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": GROQ_MODEL,
            "temperature": 0,
            "max_tokens": 300,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
        },
        timeout=20,
    )
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    payload = json.loads(content)

    score = float(payload["risk_score"])
    score = max(0.0, min(100.0, score))
    level = payload.get("risk_level") or ""
    if level not in ("Low", "Moderate", "High"):
        # recompute band if the model returned something unexpected
        level = "High" if score >= 70 else "Moderate" if score >= 40 else "Low"
    explanation = str(payload.get("explanation", ""))[:300]
    return round(score, 1), level, explanation, f"groq-{GROQ_MODEL}"
