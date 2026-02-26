@echo off
setlocal enabledelayedexpansion

if "%1"=="" (
    set SERVICE=gestion-reference
) else (
    set SERVICE=%1
)

echo ========================================
echo    Lancement de %SERVICE%
echo ========================================
echo.

echo 1. Verification de Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Docker ne repond pas!
    echo Veuillez demarrer Docker Desktop et reessayer.
    echo.
    echo Pour redemarrer Docker, executez: redemarrer-docker.bat
    pause
    exit /b 1
)
echo    [OK] Docker fonctionne

echo.
echo 2. Lancement de %SERVICE%...
docker-compose up -d %SERVICE%

if %errorlevel% equ 0 (
    echo    [OK] %SERVICE% lance avec succes
) else (
    echo    [ERREUR] Echec du lancement de %SERVICE%
    echo.
    echo Voir les logs avec:
    echo   docker-compose logs %SERVICE%
    pause
    exit /b 1
)

echo.
echo 3. Attente du demarrage (5 secondes)...
timeout /t 5 /nobreak >nul

echo.
echo 4. Etat du service:
docker-compose ps %SERVICE%

echo.
echo 5. Derniers logs (20 lignes):
echo ========================================
docker-compose logs --tail=20 %SERVICE%

echo.
echo ========================================
echo Service lance avec succes!
echo ========================================
echo.
echo Commandes utiles:
echo   Voir les logs en temps reel : docker-compose logs -f %SERVICE%
echo   Arreter le service          : docker-compose stop %SERVICE%
echo   Redemarrer le service       : docker-compose restart %SERVICE%
echo   Voir l'etat                 : docker-compose ps %SERVICE%
echo.
pause
