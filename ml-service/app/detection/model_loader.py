"""Trained-model loading.

Loads the scikit-learn model artifact from app/models/artifacts using
MODEL_VERSION; the version string is stored on every AnalysisResult
for traceability (SDD 5.1). Model is trained on publicly available,
ethically sourced mental-health text datasets (SRS CO-3).

Artifact filename convention: <MODEL_VERSION>.joblib — a pickled
scikit-learn classifier exposing predict_proba(feature_vector).
When no artifact is present the service falls back to a deterministic
heuristic scorer so the pipeline stays functional for development.
"""
from pathlib import Path

import joblib  # bundled with scikit-learn

from ..config import ARTIFACTS_DIR, MODEL_VERSION

_model = None
_loaded = False


def load_model():
    """Load and cache the classifier artifact, or None if absent."""
    global _model, _loaded
    if _loaded:
        return _model
    _loaded = True
    path = Path(ARTIFACTS_DIR) / f"{MODEL_VERSION}.joblib"
    if path.exists():
        _model = joblib.load(path)
    return _model


def model_available() -> bool:
    return load_model() is not None
