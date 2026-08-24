@echo off
title Sustainability Hub Launcher
cd /d "%~dp0backend"
start "" ".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
cd /d "%~dp0desktop"
start "" cmd /c "npm run dev"
timeout /t 8 /nobreak >nul
start http://localhost:1420
echo.
echo  Sustainability Hub is starting...
echo  - Backend API : http://localhost:8000
echo  - Desktop app : http://localhost:1420
echo.
echo  (you can close this window, the app keeps running)
timeout /t 6 >nul
