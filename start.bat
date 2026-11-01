@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo   CUBEBOX MINI - INICIALIZANDO BACKEND E FRONTEND
echo ============================================================

echo [1/2] Iniciando Backend FastAPI na porta 8000...
start "CubeBox Backend (FastAPI)" cmd /k "cd /d %~dp0 && backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000"

echo [2/2] Iniciando Frontend SPA Vite na porta 5173...
start "CubeBox Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================================
echo   SISTEMA EM EXECUCAO!
echo   - Backend Swagger: http://localhost:8000/docs
echo   - Frontend Cockpit: http://localhost:5173
echo ============================================================
pause
