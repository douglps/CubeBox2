# 🚀 Guia de Implantação: MySQL 8.0 & FastAPI na VPS Oracle Cloud (Ubuntu 24.04 LTS)

> **Projeto:** CubeBox Enterprise  
> **Target:** Oracle Cloud Infrastructure (OCI) Compute Instance (`doug-vm` / Ubuntu 24.04 LTS AMD64)  
> **Status:** Ativo & Validado  

---

## 1. 📋 Visão Geral da Arquitetura em Nuvem

Na VPS da Oracle Cloud, a aplicação opera com separação de responsabilidades e alta resiliência:
- **MySQL Server 8.0+**: Banco relacional nativo executando com engine InnoDB e charset `utf8mb4`.
- **FastAPI Backend (Uvicorn / Systemd ou Docker)**: API conectada ao MySQL através de pool de conexões persistente (`PyMySQL`).
- **Frontend SPA**: Servido via Nginx ou Caddy como reverse proxy com terminação TLS/HTTPS.

```
                    ┌───────────────────────────────┐
                    │       Cliente / Navegador     │
                    └───────────────┬───────────────┘
                                    │ (Portas 80 / 443)
                    ┌───────────────▼───────────────┐
                    │     Nginx / Reverse Proxy     │
                    └───────┬───────────────┬───────┘
                            │               │
     (Arquivos Estáticos)   │               │ (Proxy reverso /api)
    ┌───────────────────────▼──┐         ┌──▼────────────────────────┐
    │     Frontend SPA         │         │  FastAPI (Uvicorn :8000)   │
    │  (HTML5 / React / CSS)   │         └──────────────┬────────────┘
    └──────────────────────────┘                        │ (localhost:3306)
                                         ┌──────────────▼────────────┐
                                         │  MySQL 8.0+ (InnoDB)      │
                                         │  Base: cubebox            │
                                         └───────────────────────────┘
```

---

## 2. 🗄️ Passo a Passo: Instalação e Configuração do MySQL na VPS

### 2.1 Instalação do Pacote MySQL Server
Acesse a sua VM via SSH:
```bash
ssh -i ~/.ssh/sua_chave_oracle ubuntu@SEU_IP_PUBLICO_ORACLE
```

Atualize os repositórios e instale o MySQL:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install mysql-server -y
```

Verifique se o serviço está ativo:
```bash
sudo systemctl status mysql
```

### 2.2 Criação do Banco de Dados e Usuário da Aplicação
Acesse o console do MySQL como administrador:
```bash
sudo mysql
```

Execute os comandos SQL abaixo (substitua `SuaSenhaForte123!` por uma senha segura):
```sql
-- Criar a base de dados oficial com suporte a caracteres latinos e emojis
CREATE DATABASE IF NOT EXISTS cubebox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar o usuário exclusivo da aplicação (acesso restrito ao localhost)
CREATE USER IF NOT EXISTS 'cubebox_user'@'localhost' IDENTIFIED BY 'SuaSenhaForte123!';

-- Conceder privilégios estritos na base da loja
GRANT ALL PRIVILEGES ON cubebox.* TO 'cubebox_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

---

## 3. 📄 Execução do DDL Schema

O schema com tabelas, índices e restrições de integridade está disponível em `docs/schema.mysql.sql`.

Para importar na VPS via terminal:
```bash
mysql -u cubebox_user -p cubebox < docs/schema.mysql.sql
```
*(Digite a senha configurada no passo 2.2)*.

---

## 4. ⚙️ Configuração do Backend (.env) na VPS

No diretório do projeto clonado na máquina virtual (ex: `/home/ubuntu/CubeBox2`):

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Edite o `.env`:
   ```bash
   nano .env
   ```

3. Defina a string de conexão oficial do MySQL:
   ```ini
   APP_ENV=production
   DATABASE_URL=mysql+pymysql://cubebox_user:SuaSenhaForte123!@127.0.0.1:3306/cubebox?charset=utf8mb4
   API_HOST=0.0.0.0
   API_PORT=8000
   CORS_ORIGINS=http://SEU_DOMINIO_OU_IP,http://localhost:5173
   DB_POOL_SIZE=10
   DB_MAX_OVERFLOW=20
   DB_POOL_RECYCLE=3600
   ```

4. Instale as dependências no ambiente virtual Python da VPS:
   ```bash
   python3 -m venv backend/.venv
   source backend/.venv/bin/activate
   pip install --upgrade pip
   pip install -r backend/requirements.txt
   ```

5. Inicialize e popule o catálogo oficial de produtos e clientes:
   ```bash
   python -m backend.app.init_db
   ```

---

## 5. 🛡️ Otimização de Memória na Oracle Cloud (RAM < 1GB)

Como a instância possui ~1GB de RAM, é essencial garantir uma área de swap e configurar o InnoDB para evitar consumo excessivo:

### 5.1 Criar Swap de 2GB (Prevenção de Out-Of-Memory)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 5.2 Ajuste Leve no MySQL (`/etc/mysql/mysql.conf.d/mysqld.cnf`)
Adicione no final do arquivo:
```ini
[mysqld]
innodb_buffer_pool_size = 128M
max_connections = 50
```
Reinicie o serviço:
```bash
sudo systemctl restart mysql
```

---

## 6. 🔄 Execução Contínua via Systemd (Daemon)

Crie o arquivo de serviço para a API:
```bash
sudo nano /etc/systemd/system/cubebox-api.service
```

Conteúdo:
```ini
[Unit]
Description=CubeBox Enterprise API Backend
After=network.target mysql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/CubeBox2
ExecStart=/home/ubuntu/CubeBox2/backend/.venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=5
EnvironmentFile=/home/ubuntu/CubeBox2/.env

[Install]
WantedBy=multi-user.target
```

Ative e inicie:
```bash
sudo systemctl daemon-reload
sudo systemctl enable cubebox-api
sudo systemctl start cubebox-api
sudo systemctl status cubebox-api
```

