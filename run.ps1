# D:\Visual Studio Files\sustainability\run.ps1
param(
    [switch]$SkipDb,
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

Write-Host "Starting Sustainability Hub..." -ForegroundColor Green

# 1. Start PostgreSQL (Docker)
if (-not $SkipDb) {
    Write-Host "Starting PostgreSQL..." -ForegroundColor Cyan
    docker run -d --name sustainability-db `
      -e POSTGRES_DB=sustainability `
      -e POSTGRES_USER=postgres `
      -e POSTGRES_PASSWORD=postgres `
      -p 5432:5432 postgres:16 2>$null
    Start-Sleep 5
}

# 2. Start Backend
if (-not $SkipBackend) {
    Write-Host "Starting FastAPI backend..." -ForegroundColor Cyan
    $backend = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd 'D:\Visual Studio Files\sustainability\backend'; `
         .\venv\Scripts\Activate.ps1; `
         uvicorn app.main:app --reload --port 8000"
    ) -PassThru
}

# 3. Start Frontend
if (-not $SkipFrontend) {
    Write-Host "Starting Expo frontend..." -ForegroundColor Cyan
    $frontend = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd 'D:\Visual Studio Files\sustainability\mobile'; `
         `$env:NODE_OPTIONS='--max-old-space-size=4096'; `
         npx expo start"
    ) -PassThru
}

Write-Host "`n✅ All services starting!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Frontend: Check Expo QR code in the new window" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C in each window to stop." -ForegroundColor Gray