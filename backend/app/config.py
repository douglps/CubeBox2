"""
=============================================================================
GERENCIADOR DE CONFIGURAÇÕES E AMBIENTE (SETTINGS) - CUBEBOX ENTERPRISE
=============================================================================
Projeto: CubeBox Enterprise
Função no Negócio:
    Centraliza o carregamento e validação estrita de todas as variáveis
    de ambiente (Environment Variables) do sistema, suportando alternância
    transparente entre SQLite local e MySQL em VPS na Oracle Cloud.
    Implementado com fallback robusto baseado em os.environ e leitura de .env.
=============================================================================
"""
import os
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def load_env_file(dotenv_path: Path):
    """Carrega arquivo .env simples caso exista sem dependências extras."""
    if not dotenv_path.exists():
        return
    try:
        with open(dotenv_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass


# Carrega .env da raiz do projeto se presente
load_env_file(BASE_DIR / ".env")


class Settings:
    """Configurações centrais do sistema com valores padrão seguros."""

    @property
    def APP_ENV(self) -> str:
        return os.getenv("APP_ENV", "development")

    @property
    def DATABASE_URL(self) -> str:
        default_db = f"sqlite:///{BASE_DIR / 'data' / 'cubebox.db'}"
        return os.getenv("DATABASE_URL", default_db)

    @property
    def API_HOST(self) -> str:
        return os.getenv("API_HOST", "0.0.0.0")

    @property
    def API_PORT(self) -> int:
        return int(os.getenv("API_PORT", "8000"))

    @property
    def CORS_ORIGINS(self) -> str:
        return os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
        )

    @property
    def DB_POOL_SIZE(self) -> int:
        return int(os.getenv("DB_POOL_SIZE", "10"))

    @property
    def DB_MAX_OVERFLOW(self) -> int:
        return int(os.getenv("DB_MAX_OVERFLOW", "20"))

    @property
    def DB_POOL_RECYCLE(self) -> int:
        return int(os.getenv("DB_POOL_RECYCLE", "3600"))

    @property
    def cors_origins_list(self) -> List[str]:
        raw = self.CORS_ORIGINS
        if not raw or raw == "*":
            return ["*"]
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")

    @property
    def is_mysql(self) -> bool:
        return "mysql" in self.DATABASE_URL


settings = Settings()
