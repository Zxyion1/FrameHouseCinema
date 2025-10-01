@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0push_to_github.ps1" -Message "Publish site"
endlocal
