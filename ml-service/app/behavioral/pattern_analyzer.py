"""Behavioral-pattern analysis.

Per-user linguistic-marker trends across submissions: first-person
pronoun density, absolutist language, negative-emotion word frequency
(FR-10; SDD 6.5 updateBehavioralPattern()). The Node backend maintains
the persisted rolling averages; this module provides the computation.
"""


def rolling_averages(marker_series: list[dict]) -> dict:
    """Mean of each marker over an ordered series of submissions."""
    n = max(len(marker_series), 1)
    return {
        "first_person_density": round(
            sum(m.get("first_person_density", 0) for m in marker_series) / n, 2
        ),
        "absolutist_language": round(
            sum(m.get("absolutist_language", 0) for m in marker_series) / n, 2
        ),
        "negative_emotion_words": round(
            sum(m.get("negative_emotion_words", 0) for m in marker_series) / n, 2
        ),
        "analysis_count": len(marker_series),
    }
