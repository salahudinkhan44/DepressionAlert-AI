"""Text cleaning.

preprocessText() (SDD 6.2): remove symbols and URLs, lowercase,
remove irrelevant characters (FR-7).
"""
import re

_URL_RE = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
_SYMBOLS_RE = re.compile(r"[^\w\s']")          # strip punctuation/symbols, keep apostrophes
_WHITESPACE_RE = re.compile(r"\s+")


def remove_symbols_and_urls(text: str) -> str:
    """Strip URLs, mentions and non-word symbols from raw input."""
    text = _URL_RE.sub(" ", text)
    text = _SYMBOLS_RE.sub(" ", text)
    return _WHITESPACE_RE.sub(" ", text).strip()


def clean_text(text: str) -> str:
    """Full cleaning step: symbols/URLs removed + lowercased (FR-7)."""
    return remove_symbols_and_urls(text).lower()
