"""
=============================================================================
CENTRAL DE COMANDO DA API REST (FASTAPI) - CUBEBOX ENTERPRISE
=============================================================================
Projeto: CubeBox Enterprise
Função no Negócio:
    Este arquivo é a "recepção" ou "porta de entrada" informatizada da loja.
    Ele liga a tela colorida do caixa (frontend React) ao cofre de dados
    (banco SQLite) e ao "cérebro" de inteligência artificial (modelos preditivos).

Por que ele existe e o que resolve:
    Quando a atendente no caixa passa um produto, ou quando o gerente abre o
    painel para ver quanto vai vender no sábado, este arquivo recebe os pedidos,
    valida a segurança, aciona o banco e entrega a resposta em frações de segundo.

Como funciona o fluxo:
    1. [Inicialização]: Na abertura da loja, o Lifespan aplica migrações,
       sobe as tabelas do banco e carrega na memória os modelos de IA.
    2. [Segurança & CORS]: Permite que a tela do navegador fale com o servidor local.
    3. [Roteamento]: Encaminha chamadas de Vendas, Estoque, Clientes e Predições.
    4. [Health Check]: Monitora se o sistema e a inteligência artificial estão ativos.
=============================================================================
"""
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.init_db import apply_migrations
from backend.app.services.ml_service import ml_service
from backend.app.routers.operations import router as ops_router
from backend.app.routers.ml_routes import router as ml_router, get_reorder_suggestions
from backend.app.routers.dashboard import router as dash_router
from backend.app.routers.data_routes import router as data_router

logger = logging.getLogger("cubebox.api")


# [Passo 1/4] Ciclo de vida da aplicação (Rotina de Abertura e Fechamento da Loja)
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Analogia: É a rotina de ligar as luzes e abrir as portas da loja.
    Antes de receber qualquer cliente, confere se o livro-caixa tem as páginas certas
    (cria tabelas e colunas novas) e coloca na bancada as ferramentas de previsão.
    """
    apply_migrations()
    Base.metadata.create_all(bind=engine)
    ml_service.load_models()

    # [Aquecimento da IA / Zero Cold-Start]: Pré-calcula e aquece o cache em memória RAM
    # Garante que o primeiro carregamento da tela de IA no frontend seja instantâneo (sub-20ms)
    import sys, os
    if "pytest" not in sys.modules and not os.environ.get("SKIP_WARMUP"):
        try:
            with SessionLocal() as db:
                get_reorder_suggestions(force=True, db=db)
            print("[SUCESSO] Cache preditivo pré-aquecido na inicialização da loja.")
        except Exception as exc:
            logger.warning(f"[AVISO] Falha no pré-aquecimento assíncrono de IA: {exc}")

    yield
    print("[INFO] Fechando as portas da API CubeBox Enterprise.")


# [Passo 2/4] Criação da aplicação web FastAPI
app = FastAPI(
    title="CubeBox Enterprise - API de Vendas, Estoque, CRM e Predição",
    description="Backend REST com Model Serving integrado (Random Forest, DBSCAN, Naive Bayes).",
    version="2.0.0",
    lifespan=lifespan
)

# [Passo 3/4] Liberação de CORS (Configurável via Settings / .env)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# [Passo 4/4] Conexão dos guichês de atendimento (Roteadores)
app.include_router(ops_router)
app.include_router(ml_router)
app.include_router(dash_router)
app.include_router(data_router)


# =============================================================================
# TRATAMENTO GLOBAL DE EXCEÇÕES (RFC 7807 / RFC 9457 & RESILIÊNCIA TRANSAÇÃO)
# =============================================================================
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """
    Captura falhas de persistência no banco SQLite e evita vazamento de estrutura interna.
    Garante mensagem padronizada orientando o operador.
    """
    logger.error(f"[DATABASE_ERROR] Falha de persistência em {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "type": "https://cubebox.local/errors/database-error",
            "title": "Erro de Gravação",
            "status": 500,
            "detail": "Não foi possível concluir. Nenhuma alteração foi salva.",
            "code": "DATABASE_ERROR"
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Converte falhas de schema Pydantic em mensagens amigáveis de 1 linha.
    """
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    campo = " -> ".join(str(loc) for loc in first_error.get("loc", []) if loc != "body")
    msg = first_error.get("msg", "Dados inválidos.")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "type": "https://cubebox.local/errors/validation-error",
            "title": "Dados Incompletos ou Inválidos",
            "status": 422,
            "detail": f"Verifique os campos informados: {campo} ({msg})." if campo else "Dados informados estão incompletos.",
            "code": "VALIDATION_ERROR"
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Captura qualquer erro 500 não previsto e protege informações internas do sistema.
    """
    logger.critical(f"[UNHANDLED_EXCEPTION] Erro crítico em {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "type": "https://cubebox.local/errors/server-error",
            "title": "Instabilidade Temporária",
            "status": 500,
            "detail": "Não foi possível concluir. Nenhuma alteração foi salva.",
            "code": "SERVER_ERROR"
        }
    )


@app.get("/health", tags=["Monitoramento"])
def health_check():
    """
    Termômetro da loja: confere se a API está online e se os modelos de IA estão prontos.
    """
    return {
        "status": "healthy",
        "service": "CubeBox Enterprise API",
        "ml_models_loaded": ml_service.is_loaded
    }
