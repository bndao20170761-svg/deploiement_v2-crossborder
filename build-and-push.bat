@echo off
REM Script simple pour builder et pusher vers Docker Hub

echo ========================================
echo   Build et Push vers Docker Hub
echo ========================================
echo.

REM Demander le username Docker Hub
set /p DOCKERHUB_USERNAME="Entrez votre username Docker Hub: "

if "%DOCKERHUB_USERNAME%"=="" (
    echo Erreur: Username requis
    pause
    exit /b 1
)

echo.
echo Lancement du build et push...
echo Cela peut prendre 20-30 minutes...
echo.

REM Lancer le script PowerShell
powershell -ExecutionPolicy Bypass -File ".\build-and-push-all.ps1" -DockerHubUsername "%DOCKERHUB_USERNAME%" -SkipTests

pause
