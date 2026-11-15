@echo off
set "NGROK_EXE=%~dp0tools\ngrok\ngrok.exe"

if not exist "%NGROK_EXE%" (
    echo Error: ngrok.exe was not found at "%NGROK_EXE%"
    pause
    exit /b 1
)

echo ===================================================
echo Starting ngrok tunnel to http://localhost:3000
echo ===================================================
echo.
echo If this is your first time, make sure you ran setup-ngrok.bat first.
echo.
"%NGROK_EXE%" http 3000
pause
