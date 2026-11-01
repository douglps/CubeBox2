"""
=============================================================================
CONEXÃO COM O LIVRO-CAIXA DIGITAL (BANCO DE DADOS HÍBRIDO MYSQL / SQLITE)
=============================================================================
Projeto: CubeBox Enterprise
Função no Negócio:
    Este arquivo funciona como a "gaveta segura" ou o "cofre de anotações" da loja.
    Ele estabelece a ponte direta com o banco de dados (MySQL em VPS Oracle ou
    SQLite local), onde cada venda, cada garrafa retirada da prateleira e cada lote
    recebido do fornecedor ficam salvos de forma definitiva e com integridade transacional.

Por que ele existe e o que resolve:
    Suporta produção com banco MySQL em VPS Oracle Cloud (múltiplos caixas e
    containers concorrentes com pool de conexões estável), sem perder o fallback
    amigável para SQLite em desenvolvimento local.
=============================================================================
"""
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.config import settings

# [Passo 1/3] Definição da Engine de Conexão com suporte dinâmico a MySQL e SQLite
DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "cubebox.db"

if settings.is_sqlite:
    # Garante a existência do diretório pai caso opere em modo SQLite local
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # Configuração robusta para MySQL (Oracle Cloud / VPS)
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_recycle=settings.DB_POOL_RECYCLE,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    [Passo 3/3] Empréstimo temporário de conexão (Sessão do Caixa).
    Analogia: O atendente pega uma folha do caderno para anotar a transação atual.
    Ao final do atendimento (no bloco finally), a folha é arquivada e a conexão liberada.
    Em caso de erro em qualquer etapa da requisição, efetua rollback explícito.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
