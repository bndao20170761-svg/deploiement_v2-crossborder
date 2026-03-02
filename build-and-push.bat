@echo off
echo ========================================
echo   Build et Push vers Docker Hub
echo ========================================
echo.
echo Username Docker Hub: babacar1011
echo.
echo Lancement du build...
echo Cela peut prendre 20-30 minutes...
echo.

powershell -ExecutionPolicy Bypass -File ".\build-and-push-all.ps1" -DockerHubUsername babacar1011 -SkipTests

pause
