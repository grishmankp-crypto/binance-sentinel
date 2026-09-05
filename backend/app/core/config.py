import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Binance Sentinel"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Binance MCP
    BINANCE_MCP_ENDPOINT: str = os.getenv("BINANCE_MCP_ENDPOINT", "https://agent.binance.com/mcp/agentic")
    BINANCE_API_KEY: str | None = os.getenv("BINANCE_API_KEY")
    BINANCE_API_SECRET: str | None = os.getenv("BINANCE_API_SECRET")
    
    # LLM
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-3.1-pro") # Using current environment preference
    GOOGLE_API_KEY: str | None = os.getenv("GOOGLE_API_KEY")

    # Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
