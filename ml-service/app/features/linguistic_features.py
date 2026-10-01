"""Linguistic/emotional feature extraction.

extractFeatures() (SDD 6.2): builds the feature vector consumed by the
depression classifier — first-person pronoun density, absolutist
language, negative-emotion word frequency (FR-8, SDD 5).

Feature vector order (fixed — the trained artifact in
app/models/artifacts must be trained on this layout):
    [sentiment, neg_ratio, abs_ratio, first_person_ratio, pos_ratio,
     token_count_scaled]
"""
from .sentiment import NEGATIVE_WORDS, NEGATIVE_PHRASES, POSITIVE_WORDS

ABSOLUTIST_WORDS = frozenset(
    "always never nothing everything everyone nobody completely totally "
    "forever entirely all".split()
)
ABSOLUTIST_PHRASES = ("no one",)

FIRST_PERSON_WORDS = frozenset(
    "i me my mine myself im ive ill".split()
)
FIRST_PERSON_PHRASES = ("i'm", "i've", "i'll")


def _count(tokens: list[str], cleaned: str, words: frozenset, phrases: tuple) -> int:
    joined = f" {cleaned} "
    hits = sum(1 for t in tokens if t in words)
    hits += sum(joined.count(f" {p} ") for p in phrases)
    return hits


def extract_markers(tokens: list[str], cleaned_text: str) -> dict:
    """Linguistic markers as percentages of total tokens (SDD 8.1.2)."""
    total = max(len(tokens), 1)
    fp = _count(tokens, cleaned_text, FIRST_PERSON_WORDS, FIRST_PERSON_PHRASES)
    ab = _count(tokens, cleaned_text, ABSOLUTIST_WORDS, ABSOLUTIST_PHRASES)
    ng = _count(tokens, cleaned_text, NEGATIVE_WORDS, NEGATIVE_PHRASES)
    ps = sum(1 for t in tokens if t in POSITIVE_WORDS)
    return {
        "first_person_density": round(fp / total * 100, 1),
        "absolutist_language": round(ab / total * 100, 1),
        "negative_emotion_words": round(ng / total * 100, 1),
        "positive_emotion_words": round(ps / total * 100, 1),
        "token_count": len(tokens),
        "hits": {"first_person": fp, "absolutist": ab, "negative": ng, "positive": ps},
    }


def detect_indicators(markers: dict) -> list[str]:
    """Human-readable flags surfaced on the Analysis Result page."""
    indicators = []
    if markers["negative_emotion_words"] >= 4:
        indicators.append("Elevated negative-emotion vocabulary")
    if markers["absolutist_language"] >= 3:
        indicators.append("Absolutist language detected")
    if markers["first_person_density"] >= 6:
        indicators.append("High self-referential (first-person) focus")
    if markers["hits"]["negative"] > 0 and markers["hits"]["positive"] == 0:
        indicators.append("No positive-affect terms present")
    if not indicators:
        indicators.append("No strong depressive linguistic markers detected")
    return indicators


def extract_features(tokens: list[str], cleaned_text: str, sentiment: float) -> tuple[dict, list[float], list[str]]:
    """Return (markers, feature_vector, indicators) (SDD 6.2)."""
    markers = extract_markers(tokens, cleaned_text)
    total = max(markers["token_count"], 1)
    vector = [
        sentiment,
        markers["hits"]["negative"] / total,
        markers["hits"]["absolutist"] / total,
        markers["hits"]["first_person"] / total,
        markers["hits"]["positive"] / total,
        min(markers["token_count"] / 200.0, 1.0),
    ]
    indicators = detect_indicators(markers)
    markers.pop("hits")  # internal counts — not persisted
    markers.pop("positive_emotion_words")
    markers.pop("token_count")
    return markers, vector, indicators
