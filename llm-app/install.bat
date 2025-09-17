@echo off
chcp 65001 > nul
echo Installing with admin privileges...
powershell -ExecutionPolicy Bypass -File "%~dp0install-windows.ps1"
pause