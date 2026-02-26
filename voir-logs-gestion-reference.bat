@echo off
echo ========================================
echo    Logs de gestion-reference
echo ========================================
echo.

echo Verification de l'etat du service...
docker-compose ps gestion-reference
echo.

echo ========================================
echo Affichage des logs (Ctrl+C pour arreter)
echo ========================================
echo.

docker-compose logs -f gestion-reference
