from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "DevOps Lab Platform MVP"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkey-please-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./devops_lab.db"

    class Config:
        case_sensitive = True

settings = Settings()
