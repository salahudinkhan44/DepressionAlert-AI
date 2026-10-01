"""Tokenization and stop-word removal.

Produces the token list stored on ProcessedText (SDD 5.1) using
NLTK/spaCy (SRS CO-2). spaCy is used when its English model is
installed; otherwise NLTK's regex tokenizer is used, with a bundled
stop-word list so the service works without downloaded corpora.
"""
import re

# Bundled English stop words (NLTK-derived subset) — used when NLTK's
# 'stopwords' corpus or the spaCy model isn't available on the host.
_FALLBACK_STOPWORDS = frozenset(
    "i me my myself we our ours ourselves you your yours yourself yourselves "
    "he him his himself she her hers herself it its itself they them their "
    "theirs themselves what which who whom this that these those am is are "
    "was were be been being have has had having do does did doing a an the "
    "and but if or because as until while of at by for with about against "
    "between into through during before after above below to from up down "
    "in out on off over under again further then once here there when where "
    "why how all any both each few more most other some such no nor not "
    "only own same so than too very s t can will just don should now"
    .split()
)


def _load_stopwords() -> frozenset:
    try:
        from nltk.corpus import stopwords  # NLTK (SRS CO-2)

        return frozenset(stopwords.words("english"))
    except Exception:
        return _FALLBACK_STOPWORDS


STOPWORDS = _load_stopwords()
_TOKEN_RE = re.compile(r"[a-z']+")


def tokenize(text: str) -> list[str]:
    """Tokenize cleaned lowercase text into word tokens."""
    try:
        from nltk.tokenize import word_tokenize  # NLTK (SRS CO-2)

        tokens = word_tokenize(text)
        return [t for t in tokens if any(c.isalpha() for c in t)]
    except Exception:
        return _TOKEN_RE.findall(text)


def remove_stop_words(tokens: list[str]) -> list[str]:
    """Drop stop words from the token list (FR-7)."""
    return [t for t in tokens if t not in STOPWORDS and len(t) > 1]
