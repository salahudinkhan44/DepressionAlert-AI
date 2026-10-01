"""Sentiment analysis.

computeSentiment() (SDD 6.2): polarity score in [-1, 1] stored on
ProcessedText.sentiment_score (FR-8). Lexicon-based: positive and
negative affect word lists scored against the token stream.
"""

NEGATIVE_WORDS = frozenset(
    "sad hopeless empty alone lonely tired numb worthless cry crying broken "
    "anxious dark depressed depression miserable exhausted pointless hate "
    "hurt pain guilt failure failed useless burden sleep insomnia void "
    "overwhelmed stress stressed scared afraid lost".split()
)
NEGATIVE_PHRASES = ("give up", "no energy", "can't sleep", "cannot sleep")

POSITIVE_WORDS = frozenset(
    "happy grateful good great love excited hopeful calm better proud fun "
    "joy thankful smile win amazing".split()
)


def count_affect(tokens: list[str], cleaned_text: str) -> tuple[int, int]:
    """Return (negative_hits, positive_hits) over tokens + phrases."""
    joined = f" {cleaned_text} "
    neg = sum(1 for w in tokens if w in NEGATIVE_WORDS)
    neg += sum(joined.count(f" {p} ") for p in NEGATIVE_PHRASES)
    pos = sum(1 for w in tokens if w in POSITIVE_WORDS)
    return neg, pos


def compute_sentiment(tokens: list[str], cleaned_text: str, risk_score: float) -> float:
    """Polarity in [-1, 1]: affect balance adjusted by the risk signal."""
    neg, pos = count_affect(tokens, cleaned_text)
    polarity = (pos - neg) / max(pos + neg, 1) * 0.9
    polarity += 0.15 if risk_score < 40 else -0.15
    return round(max(-1.0, min(1.0, polarity)), 2)
