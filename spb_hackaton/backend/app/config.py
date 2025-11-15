import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JSON_STORAGE_PATH: str = "users.json"
    cors_origins: list = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"]
    # Mistral AI API Configuration
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    MISTRAL_API_BASE: str = os.getenv("MISTRAL_API_BASE", "https://api.mistral.ai/v1/chat/completions")
    MISTRAL_MODEL: str = os.getenv("MISTRAL_MODEL", "mistral-small")

settings = Settings()