@echo off
echo ========================================
echo    Redemarrage de Docker Desktop
echo ========================================
echo.

echo 1. Arret de Docker Desktop...
taskkill /F /IM "Docker Desktop.exe" 2>nul
if %errorlevel% equ 0 (
    echo    Docker Desktop arrete
) else (
    echo    Docker Desktop n'etait pas en cours d'execution
)

echo.
echo 2. Attente de 10 secondes...
timeout /t 10 /nobreak >nul

echo.
echo 3. Demarrage de Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo    Docker Desktop en cours de demarrage...

echo.
echo 4. Attente du demarrage complet (30 secondes)...
echo    Verifiez que l'icone Docker devient verte dans la barre des taches
timeout /t 30 /nobreak

echo.
echo 5. Verification de Docker...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Docker est pret!
) else (
    echo    [ATTENTION] Docker n'est pas encore pret
    echo    Attendez encore quelques secondes et reessayez
)

echo.
echo ========================================
echo Vous pouvez maintenant utiliser Docker
echo ========================================
echo.
echo Commandes utiles:
echo   docker-compose up -d gestion-reference
echo   docker-compose ps
echo   docker-compose logs -f gestion-reference
echo.
pause
