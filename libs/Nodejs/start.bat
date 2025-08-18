@echo off
REM Navigate to the nodejs directory
cd /d "%~dp0"

REM Install dependencies if needed
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

REM Start the development server
echo Starting Vite development server...
call npm run dev
