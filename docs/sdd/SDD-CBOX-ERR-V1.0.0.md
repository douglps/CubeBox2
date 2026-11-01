# 📐 Software Design Document (SDD) - Resiliência e Tratamento de Erros Padronizado (RFC 7807 & Smart Transient Recovery)

> **Identificador:** SDD-CBOX-ERR-V1.0.0  
> **Status:** Aprovado / Ativo  
> **Padrão:** IEEE 1016 & Governança Antigravity  
> **Versão:** 1.0.0  
> **Data:** 2026-10-30  
> **Autor:** Antigravity Architect Agent  

---

## 1. 🎯 Visão Geral & Objetivos

Este documento formaliza a arquitetura unificada de **Tratamento, Resiliência e Exibição Humanizada de Erros** no CubeBox Enterprise:
1. **Padronização RFC 7807 / RFC 9457 no Backend (FastAPI):**
   - Respostas de erro estruturadas e previsíveis (`code`, `message`, `status`, `detail`).
   - Captura global de exceções não tratadas e falhas de banco (`SQLAlchemyError`) com `rollback` automático.
2. **Result Pattern no Cliente HTTP (`api.ts`):**
   - Extração padronizada de mensagens diretas, sem vazamento de detalhes técnicos ou falhas silenciosas (`catch(console.error)`).
3. **Smart Transient Recovery na Interface (UI):**
   - Mensagens diretas de 1 linha sem jargão técnico.
   - Botão **`[ Tentar novamente ]`** habilitado **estritamente em falhas transitórias** (queda de rede, timeout, HTTP 500/503).
   - Erros de validação e regras comerciais (estoque insuficiente, produto congelado, duplicidade) exibem apenas orientação direta, eliminando *Rage Clicks*.
   - Proteção de estado do formulário e carrinho (*Zero Data Loss*).

---

## 2. 🏛️ Princípios Arquiteturais & Referências Acadêmicas

* **Heurística #9 de Jakob Nielsen (NN/g):** "Ajudar os usuários a reconhecer, diagnosticar e se recuperar de erros" com mensagens claras, sem códigos misteriosos e com ponte construtiva de recuperação.
* **RFC 7807 / RFC 9457 (Problem Details for HTTP APIs):** Contrato padronizado para serialização de erros de máquina e aplicação.
* **TanStack Resilience Guidelines:** Curto-circuito em falhas de cliente (4xx não devem acionar retry) e repetição seletiva com debounce em falhas de rede e infraestrutura (5xx/Network).
* **WCAG 2.1 AA:** Notificações de alerta utilizam `role="alert"` e `aria-live="polite"` para garantia de acessibilidade em leitores de tela.

---

## 3. 📐 Matriz Semântica de Mensagens & Ações

| Categoria | Condição / Status HTTP | Mensagem Direta ao Usuário | Ação Permitida |
| :--- | :--- | :--- | :---: |
| **Transitório** | Queda de rede / API Offline (0) | *Sem conexão com o sistema. Verifique a rede.* | `[ 🔄 Tentar novamente ]` |
| **Transitório** | Falha de Banco / Erro 500 | *Não foi possível concluir. Nenhuma alteração foi salva.* | `[ 🔄 Tentar novamente ]` |
| **Transitório** | Model Serving Indisponível (503) | *Cálculo de previsão temporariamente indisponível.* | `[ 🔄 Tentar novamente ]` |
| **Regra Comercial** | Saldo insuficiente (422) | *Estoque insuficiente: há apenas {saldo} un deste item.* | *Sem retry* |
| **Regra Comercial** | Produto Congelado (422) | *Este produto está bloqueado para venda pela gerência.* | *Sem retry* |
| **Regra Comercial** | Documento duplicado (409) | *Este CPF já pertence a outro cliente cadastrado.* | *Sem retry* |
| **Regra Comercial** | SKU duplicado (409) | *Já existe um produto cadastrado com este SKU.* | *Sem retry* |

---

## 4. 🛠️ Contrato do Componente `InlineAlert`

```typescript
export interface InlineAlertProps {
  message: string;
  variant?: 'error' | 'warning' | 'info';
  onRetry?: () => Promise<void> | void;
  onDismiss?: () => void;
  className?: string;
}
```

---

## 5. 🛡️ Plano de Rollback & Observabilidade

- Em caso de falha de banco no backend, a sessão executa `db.rollback()` imediatamente, evitando tabelas bloqueadas no SQLite.
- Logs com stack trace completo são emitidos apenas no console e no arquivo de log do servidor, isolando o frontend de informações sensíveis.
