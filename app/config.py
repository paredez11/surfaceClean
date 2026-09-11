# app/config.py

from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from pathlib import Path
from dotenv import load_dotenv
import os
import socket

BASE_DIR = Path(__file__).resolve().parent.parent

# === Load .env file based on environment ===
ENV = os.getenv("ENVIRONMENT", "development")
ENV_FILE = BASE_DIR / f".env.{ENV}" if ENV != "development" else BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_FILE)

# === Dynamically determine database host ===
def resolve_database_url():
    running_in_docker = (
        os.getenv("RUNNING_IN_DOCKER") == "true" or
        socket.gethostname().lower().startswith("docker") or
        os.getenv("FORCE_DOCKER_DB") == "true"
    )

    return (
        os.getenv("DATABASE_URL_DOCKER")
        if running_in_docker else
        os.getenv("DATABASE_URL")
    )

class Settings(BaseSettings):
    # === Server ===
    PORT: int = 2911
    HOST: str = "0.0.0.0"

    # === Environment ===
    DEBUG: bool = ENV == "development"
    ENVIRONMENT: str = ENV

    # === JWT Auth ===
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 720

    # === Database ===
    SCHEMA: str = "public"

    # === Cloudinary ===
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    CLOUDINARY_URL: str

    model_config = ConfigDict(extra="allow") #type: ignore

settings = Settings() #type: ignore[call-arg]