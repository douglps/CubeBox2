param (
    [switch]$NoBuild = $false
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Write-Step {
    param([string]$Step, [string]$Title, [string]$Icon = "[>]")
    Write-Host ""
    Write-Host "$Icon [$Step] $Title" -ForegroundColor Cyan
    Write-Host ("-" * 60) -ForegroundColor DarkGray
}

function Write-Success {
    param([string]$Message)
    Write-Host "   [OK] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "   [INFO] $Message" -ForegroundColor Gray
}

function Write-WarningMsg {
    param([string]$Message)
    Write-Host "   [AVISO] $Message" -ForegroundColor Yellow
}

function Kill-Port {
    param([int]$Port, [string]$ServiceName)
    Write-Info "Verificando se a porta $Port ($ServiceName) esta ocupada..."
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidToKill in $pids) {
            try {
                $proc = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
                $procName = if ($proc) { $proc.ProcessName } else { "PID $pidToKill" }
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                Write-Success "Processo '$procName' (PID: $pidToKill) na porta $Port finalizado."
            } catch {
                Write-WarningMsg "Nao foi possivel finalizar o PID $pidToKill na porta $Port."
            }
        }
        Start-Sleep -Milliseconds 600
    } else {
        Write-Success "Porta $Port livre para uso."
    }
}

$rootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"
$pythonExe = Join-Path $backendDir ".venv\Scripts\python.exe"

Clear-Host
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "  CUBEBOX MINI - LABORATORIO OPERACIONAL (LAB BOOTSTRAP)   " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Blue
Write-Host " Inicializando rotina completa de reset, validacao e subida" -ForegroundColor DarkGray

# 1. DERRUBAR PORTAS ABERTAS (Cleanup)
Write-Step "1/5" "Liberando portas de rede (8000 e 5173)..." "[1]"
Kill-Port -Port 8000 -ServiceName "Backend FastAPI"
Kill-Port -Port 5173 -ServiceName "Frontend Vite"

# 2. BUILD E VALIDACAO DO FRONTEND
if (-not $NoBuild) {
    Write-Step "2/5" "Validando tipagem e compilando o Frontend (Build SPA)..." "[2]"
    Push-Location $frontendDir
    try {
        Write-Info "Executando 'npm run build'..."
        cmd /c "npm run build"
        if ($LASTEXITCODE -ne 0) {
            throw "Falha na compilacao do frontend."
        }
        Write-Success "Frontend compilado e validado com sucesso!"
    } finally {
        Pop-Location
    }
} else {
    Write-Step "2/5" "Build do Frontend ignorado via flag -NoBuild" "[SKIP]"
}

# 3. BANCO DE DADOS & MIGRATIONS / SEED
Write-Step "3/5" "Verificando integridade e aplicando seed no Banco SQLite..." "[3]"

if (-not (Test-Path $pythonExe)) {
    Write-WarningMsg "Ambiente virtual Python (.venv) nao encontrado em backend\.venv."
    Write-Info "Tentando utilizar o Python global do sistema..."
    $pythonExe = "python"
}

try {
    Push-Location $rootDir
    & $pythonExe -c "import backend.app.init_db as db; db.init_db()"
    Pop-Location
    Write-Success "Tabelas e catalogo de 20 SKUs validados com sucesso!"
} catch {
    Write-WarningMsg "Alerta ao inicializar banco: $_"
}

# 4. INICIALIZACAO DO BACKEND FASTAPI
Write-Step "4/5" "Iniciando o servidor Backend FastAPI na porta 8000..." "[4]"
$backendStartCmd = "cd /d `"$rootDir`" && `"$pythonExe`" -m uvicorn backend.app.main:app --reload --port 8000"
Start-Process cmd.exe -ArgumentList "/k", $backendStartCmd
Write-Success "Janela do Backend (FastAPI) iniciada!"
Write-Info "Aguardando 2 segundos para estabilizacao da API..."
Start-Sleep -Seconds 2

# 5. INICIALIZACAO DO FRONTEND COCKPIT
Write-Step "5/5" "Iniciando o Cockpit Frontend (Vite SPA) na porta 5173..." "[5]"
$frontendStartCmd = "cd /d `"$frontendDir`" && npm run dev"
Start-Process cmd.exe -ArgumentList "/k", $frontendStartCmd
Write-Success "Janela do Frontend (Vite) iniciada!"

# PAINEL FINAL RESUMO
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  SISTEMA CUBEBOX EM OPERACAO COMPLETA!                     " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Frontend Cockpit : http://localhost:5173" -ForegroundColor White
Write-Host "  API Swagger Docs : http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Metricas & Saude : http://localhost:8000/api/v1/health" -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor Green
Write-Host " Dica: Duas janelas dedicadas foram abertas para monitorar os logs." -ForegroundColor Yellow
Write-Host "       Para reiniciar tudo a qualquer momento: npm run lab" -ForegroundColor DarkGray
Write-Host ""
