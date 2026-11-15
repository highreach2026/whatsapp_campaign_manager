$ErrorActionPreference = "Stop"
Write-Host "High Reach WhatsApp Campaign Manager setup" -ForegroundColor Cyan

$nodePaths = @(
  "$env:LOCALAPPDATA\Programs\nodejs",
  "C:\Program Files\nodejs",
  "C:\Program Files (x86)\nodejs"
)
foreach ($p in $nodePaths) {
  if (Test-Path $p) {
    $env:PATH = "$p;" + $env:PATH
    break
  }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is not installed. Install Node.js 20.9+ first, then run this script again." -ForegroundColor Red
  exit 1
}

$nodeVersion = node --version
Write-Host "Node detected: $nodeVersion" -ForegroundColor Green

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Created .env.local. Open it and fill your Meta + Supabase credentials." -ForegroundColor Yellow
} else {
  Write-Host ".env.local already exists." -ForegroundColor Green
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
& npm install

Write-Host "Setup complete. After filling .env.local, run: npm run dev" -ForegroundColor Green
