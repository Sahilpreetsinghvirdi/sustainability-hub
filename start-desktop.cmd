@echo off
title Sustainability Hub Launcher
cd /d "%~dp0desktop"
start "" cmd /c "npm run dev"
timeout /t 8 /nobreak >nul
start http://localhost:1420
echo.
echo  Sustainability Hub is starting (backend-free - no Python needed)...
echo  - Desktop app : http://localhost:1420
echo  - Just add your Gemini/OpenAI key in Settings - AI calls go direct to Google/OpenAI
echo.
echo  (you can close this window, the app keeps running)
timeout /t 6 >nul
