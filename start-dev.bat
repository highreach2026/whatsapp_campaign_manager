@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%PATH%"
cd /d "%~dp0"
echo Node version:
call node -v
echo Starting dev server...
call npm run dev
