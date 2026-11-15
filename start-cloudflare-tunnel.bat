@echo off
set "CF_EXE=%~dp0tools\cloudflared\cloudflared.exe"

if not exist "%CF_EXE%" (
    echo Error: cloudflared.exe was not found at "%CF_EXE%"
    pause
    exit /b 1
)

echo ===================================================
echo Starting Cloudflare Tunnel (NO ACCOUNT/LOGIN NEEDED)
echo Forwarding to http://localhost:3000 ...
echo ===================================================
echo.
echo Look for the URL ending with .trycloudflare.com below!
echo.
"%CF_EXE%" tunnel --url http://localhost:3000
pause
