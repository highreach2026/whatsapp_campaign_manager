$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

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
Write-Host "Node version: $(node -v)" -ForegroundColor Green
Write-Host "Starting High Reach WhatsApp Campaign Manager dev server..." -ForegroundColor Cyan
npm run dev
