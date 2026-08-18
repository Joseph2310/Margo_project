from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Beneficiaries API"
    app_version: str = "1.0.0"
    app_env: str = "development"
    app_debug: bool = False
    api_prefix: str = "/api/v1"
    database_url: str = (
        "postgresql+psycopg://beneficiaries:beneficiaries@localhost:5432/beneficiaries"
    )
    cors_origins: str = "*"

    jwt_secret_key: str = Field(
        default="change-this-development-secret-before-hosting",
        min_length=32,
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    password_reset_token_expire_minutes: int = 15

    verification_code_ttl_seconds: int = 600
    verification_max_attempts: int = 5
    dev_verification_code: str = Field(default="123456", pattern=r"^\d{6}$")
    expose_verification_code: bool = True

    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str = "noreply@example.com"
    smtp_starttls: bool = True
    smtp_use_ssl: bool = False
    smtp_timeout_seconds: int = 10

    auto_seed: bool = True
    demo_user_email: str = "joy.barakat@hotmail.com"
    demo_user_password: str = "Password1"
    whatsapp_group_url: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",")]
        return [origin for origin in origins if origin]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
