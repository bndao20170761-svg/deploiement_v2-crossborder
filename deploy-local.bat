@echo off
echo ========================================
echo   Deploiement Local - 14 Services
echo ========================================
echo.
echo Build et demarrage de tous les services:
echo - 4 Bases de donnees
echo - 3 Services Edge
echo - 4 Microservices Metier
echo - 3 Frontends
echo.
echo Cela peut prendre 25-30 minutes...
echo.

powershell -ExecutionPolicy Bypass -File ".\deploy-local.ps1"

pause
