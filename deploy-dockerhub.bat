@echo off
REM Script simple pour déployer depuis Docker Hub

echo ========================================
echo   Deploiement depuis Docker Hub
echo ========================================
echo.

REM Vérifier si PowerShell est disponible
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Erreur: PowerShell n'est pas disponible
    pause
    exit /b 1
)

REM Demander le username Docker Hub
set /p DOCKERHUB_USERNAME="Entrez votre username Docker Hub: "

if "%DOCKERHUB_USERNAME%"=="" (
    echo Erreur: Username requis
    pause
    exit /b 1
)

echo.
echo Lancement du deploiement...
echo.

REM Lancer le script PowerShell
powershell -ExecutionPolicy Bypass -File ".\deploy-from-dockerhub.ps1" -DockerHubUsername "%DOCKERHUB_USERNAME%"

pause
