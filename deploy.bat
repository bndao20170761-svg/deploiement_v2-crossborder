@echo off
echo ========================================
echo   Deploiement depuis Docker Hub
echo ========================================
echo.
echo Username Docker Hub: babacar1011
echo.

powershell -ExecutionPolicy Bypass -File ".\deploy-from-dockerhub.ps1" -DockerHubUsername babacar1011

pause
