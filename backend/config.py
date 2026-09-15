from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    resend_api_key: str = ""
    resend_webhook_secret: str = ""
    resend_api_base_url: str = "https://api.resend.com"
    resend_from_email: str = "MailMind <no-reply@mailmind.dev>"

    groq_api_key: str = ""
    llm_model: str = "llama-3.3-70b-versatile"
    reply_llm_model: str = "llama-3.1-8b-instant"
    huggingfacehub_api_token: str = ""
    hitl_confidence_threshold: float = 0.75
    frontend_origin: str = "http://localhost:3000"

    database_url: str = "postgresql://user:pass@localhost:5432/mailmind"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
