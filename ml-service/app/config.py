"""Service configuration — loads .env and exposes settings.

ML_SERVICE_PORT     port the internal API listens on (default 8000)
ML_SERVICE_API_KEY  shared key the Node backend must present (SRS 6.2)
MODEL_VERSION       artifact id stored on every AnalysisResult (SDD 5.1)
"""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

ML_SERVICE_PORT = int(os.getenv("ML_SERVICE_PORT", "8000"))
ML_SERVICE_API_KEY = os.getenv("ML_SERVICE_API_KEY", "dev-ml-service-key")
MODEL_VERSION = os.getenv("MODEL_VERSION", "v1.0.0")

# Groq LLM scoring (OpenAI-compatible API). When GROQ_API_KEY is set the
# depression-risk score is produced by the configured Groq model.
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_API_URL = os.getenv(
    "GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions"
)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "models" / "artifacts"
