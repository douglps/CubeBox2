"""
=============================================================================
CENTRAL DE AUDITORIA E HIGIENIZAÇÃO DE DADOS (DATA SANITIZATION)
=============================================================================
Projeto: CubeBox Mini
Função no Negócio:
    Este arquivo atua como o "faxineiro digital" e "auditor cadastral" da loja.
    Ele varre a lista de clientes e transações em busca de erros humanos comuns,
    como CPFs com letras soltas, nomes com maiúsculas desorganizadas ou telefones
    sem código de área.

Por que ele existe e o que resolve:
    Dados desorganizados impedem a entrega correta de pedidos, geram cobranças erradas
    e bagunçam as métricas do CRM de fidelização. Esta rota limpa o cadastro em massa
    e gera um relatório transparente para que o comerciante saiba o que foi retificado.

Como funciona o fluxo:
    1. [sanitize_customers_batch]: Recupera todos os cadastros no banco.
    2. Aplica validação matemática oficial do CPF/CNPJ (Dígito Verificador Módulo 11).
    3. Normaliza nomes para formato legível de apresentação e remove pontuações inúteis.
    4. Grava a base corrigida e emite a trilha de auditoria completa.
=============================================================================
"""
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import Customer
from backend.app.services.data_cleaner import clean_customer_record, validate_cpf_cnpj

router = APIRouter(prefix="/api/data", tags=["Governança & Higienização de Dados"])


@router.post("/sanitize/customers")
def sanitize_customers_batch(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Executa a varredura e higienização em lote na base de clientes:
    - Normaliza nomes (Title Case com remoção de conectivos).
    - Extrai apenas dígitos para canonicidade de CPF, Telefone e CEP.
    - Valida CPF/CNPJ via algoritmo oficial de Módulo 11.
    - Gera relatório de auditoria detalhado (Audit Trail).
    """
    customers = db.query(Customer).all()
    total_processed = len(customers)
    total_modified = 0
    invalids_count = 0
    audit_trail: List[Dict[str, Any]] = []

    for c in customers:
        raw_data = {
            "id": c.id,
            "nome": c.nome,
            "cpf_cnpj": c.cpf_cnpj,
            "telefone": c.telefone,
            "email": c.email,
            "cep": c.cep,
            "logradouro": c.logradouro,
            "numero": c.numero,
            "complemento": c.complemento,
            "bairro": c.bairro,
            "cidade": c.cidade,
            "estado": c.estado,
            "referencia": c.referencia
        }

        cleaned_data, diff = clean_customer_record(raw_data)

        if diff:
            total_modified += 1
            if "cpf_cnpj_invalido" in diff:
                invalids_count += 1

            # Aplicar alterações no modelo persistido
            c.nome = cleaned_data["nome"]
            c.cpf_cnpj = cleaned_data["cpf_cnpj"]
            c.telefone = cleaned_data["telefone"]
            c.cep = cleaned_data["cep"]
            c.estado = cleaned_data["estado"]

            # Atualizar também os endereços vinculados em customer_addresses
            for addr in c.addresses:
                addr.cep = cleaned_data["cep"]
                addr.estado = cleaned_data["estado"]

            audit_trail.append({
                "customer_id": c.id,
                "customer_nome": c.nome,
                "alteracoes": diff
            })

    if total_modified > 0:
        db.commit()

    return {
        "status": "success",
        "total_registros_avaliados": total_processed,
        "total_registros_higienizados": total_modified,
        "documentos_invalidos_detectados": invalids_count,
        "relatorio_auditoria": audit_trail
    }


@router.get("/validate-doc")
def validate_document(doc: str) -> Dict[str, Any]:
    """Valida um documento (CPF ou CNPJ) em tempo real via algoritmo de Módulo 11."""
    is_valid = validate_cpf_cnpj(doc)
    return {
        "documento": doc,
        "valido": is_valid
    }
