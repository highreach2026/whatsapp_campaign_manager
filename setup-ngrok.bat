@echo off
set "PATH=%~dp0tools\ngrok;%PATH%"

echo ========================================================
echo               NGROK AUTHTOKEN SETUP
echo ========================================================
echo.
if "%~1"=="" (
    set /p "TOKEN=Paste your ngrok token here and press Enter: "
) else (
    set "TOKEN=%~1"
)

if "%TOKEN%"=="" (
    echo Error: No token provided.
    pause
    exit /b 1
)

echo.
echo Saving token...
ngrok config add-authtoken %TOKEN%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo SUCCESS: Authtoken configured successfully!
    echo ========================================================
    echo.
    echo Starting ngrok tunnel now on port 3000...
    echo.
    ngrok http 3000
) else (
    echo.
    echo Failed to save token. Please check that you pasted just the token.
    pause
)
