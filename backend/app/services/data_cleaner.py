"""
=============================================================================
MOTOR DE SANEAMENTO E PADRONIZAÇÃO CADASTRAL (DATA CLEANER)
=============================================================================
Projeto: CubeBox Mini
Função no Negócio:
    Este arquivo é o "corretor ortográfico e contábil" do cadastro da conveniência.
    Ele confere se os documentos digitados no balcão são reais (usando as regras oficiais
    da Receita Federal para CPF e CNPJ) e deixa nomes de clientes, telefones e endereços
    organizados e legíveis.

Por que ele existe e o que resolve:
    No atendimento rápido de balcão ou delivery, é frequente digitar números a mais,
    trocar letras por símbolos ou deixar letras minúsculas desordenadas. Este motor
    corrige esses desvios automaticamente sem burocracia para o operador do PDV.

Como funciona o fluxo:
    1. [validate_cpf / validate_cnpj]: Testa a validade matemática dos dígitos verificadores (Módulo 11).
    2. [normalize_name]: Transforma nomes bagunçados em maiúsculas e minúsculas elegantes (Title Case).
    3. [normalize_phone & normalize_cep]: Remove traços, barras e parênteses, guardando apenas números puros.
    4. [clean_customer_record]: Consolida a ficha do cliente antes de gravar no banco de dados.
=============================================================================
"""
import re
from typing import Optional, Dict, Any, Tuple


CONECTIVOS_NOME = {"de", "da", "do", "das", "dos", "e"}


def validate_cpf(cpf: str) -> bool:
    """Valida matematicamente CPF de 11 dígitos através do algoritmo de Módulo 11."""
    digits = re.sub(r"\D", "", cpf or "")
    if len(digits) != 11:
        return False
    if digits == digits[0] * 11:
        return False

    # Primeiro dígito verificador
    soma = sum(int(digits[i]) * (10 - i) for i in range(9))
    resto = (soma * 10) % 11
    d1 = 0 if resto == 10 else resto
    if int(digits[9]) != d1:
        return False

    # Segundo dígito verificador
    soma = sum(int(digits[i]) * (11 - i) for i in range(10))
    resto = (soma * 10) % 11
    d2 = 0 if resto == 10 else resto
    if int(digits[10]) != d2:
        return False

    return True


def validate_cnpj(cnpj: str) -> bool:
    """Valida matematicamente CNPJ de 14 dígitos através do algoritmo de Módulo 11."""
    digits = re.sub(r"\D", "", cnpj or "")
    if len(digits) != 14:
        return False
    if digits == digits[0] * 14:
        return False

    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(digits[i]) * pesos1[i] for i in range(12))
    resto = soma % 11
    d1 = 0 if resto < 2 else 11 - resto
    if int(digits[12]) != d1:
        return False

    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(digits[i]) * pesos2[i] for i in range(13))
    resto = soma % 11
    d2 = 0 if resto < 2 else 11 - resto
    if int(digits[13]) != d2:
        return False

    return True


def validate_cpf_cnpj(doc: Optional[str]) -> bool:
    """Verifica se o documento é um CPF válido (11 dígitos) ou CNPJ válido (14 dígitos)."""
    if not doc:
        return True  # Opcional no cadastro
    digits = re.sub(r"\D", "", doc)
    if len(digits) == 11:
        return validate_cpf(digits)
    elif len(digits) == 14:
        return validate_cnpj(digits)
    return False


def clean_name(name: Optional[str]) -> str:
    """Normaliza nome de clientes: remove espaços espúrios e aplica Title Case respeitando conectivos."""
    if not name:
        return ""
    words = re.sub(r"\s+", " ", name.strip()).split(" ")
    sanitized = []
    for idx, w in enumerate(words):
        w_lower = w.lower()
        if idx > 0 and w_lower in CONECTIVOS_NOME:
            sanitized.append(w_lower)
        else:
            sanitized.append(w.capitalize())
    return " ".join(sanitized)


def clean_phone(phone: Optional[str]) -> Optional[str]:
    """Extrai dígitos do telefone e retorna no formato canônico (apenas dígitos: 10 ou 11)."""
    if not phone:
        return None
    digits = re.sub(r"\D", "", phone)
    if len(digits) in (10, 11):
        return digits
    return phone.strip()


def clean_cep(cep: Optional[str]) -> Optional[str]:
    """Retorna o CEP canônico (apenas 8 dígitos numéricos)."""
    if not cep:
        return None
    digits = re.sub(r"\D", "", cep)
    if len(digits) == 8:
        return digits
    return digits if digits else None


def clean_customer_record(record: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Higieniza um registro de cliente completo e retorna:
    - (cleaned_record, audit_diff)
    """
    audit = {}
    cleaned = dict(record)

    # 1. Nome
    raw_name = record.get("nome", "")
    sanitized_name = clean_name(raw_name)
    if sanitized_name != raw_name:
        audit["nome"] = {"de": raw_name, "para": sanitized_name}
        cleaned["nome"] = sanitized_name

    # 2. Documento CPF/CNPJ
    raw_doc = record.get("cpf_cnpj")
    if raw_doc:
        digits_doc = re.sub(r"\D", "", str(raw_doc))
        is_valid = validate_cpf_cnpj(digits_doc)
        if not is_valid:
            audit["cpf_cnpj_invalido"] = {"valor_original": raw_doc, "acao": "movido_para_inconsistencia"}
            cleaned["cpf_cnpj"] = None
        else:
            if digits_doc != raw_doc:
                audit["cpf_cnpj"] = {"de": raw_doc, "para": digits_doc}
            cleaned["cpf_cnpj"] = digits_doc

    # 3. Telefone
    raw_phone = record.get("telefone")
    if raw_phone:
        cleaned_phone = clean_phone(raw_phone)
        if cleaned_phone != raw_phone:
            audit["telefone"] = {"de": raw_phone, "para": cleaned_phone}
            cleaned["telefone"] = cleaned_phone

    # 4. CEP
    raw_cep = record.get("cep")
    if raw_cep:
        cleaned_cep = clean_cep(raw_cep)
        if cleaned_cep != raw_cep:
            audit["cep"] = {"de": raw_cep, "para": cleaned_cep}
            cleaned["cep"] = cleaned_cep

    # 5. Estado
    raw_uf = record.get("estado")
    if raw_uf:
        cleaned_uf = raw_uf.strip().upper()[:2]
        if cleaned_uf != raw_uf:
            audit["estado"] = {"de": raw_uf, "para": cleaned_uf}
            cleaned["estado"] = cleaned_uf

    return cleaned, audit
