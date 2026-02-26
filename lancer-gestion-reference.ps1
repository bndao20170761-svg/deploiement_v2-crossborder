# Script pour lancer gestion-reference
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Lancement de gestion-reference" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
Write-Host "`nVérification de Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "✗ Docker n'est pas en cours d'exécution!" -ForegroundColor Red
    Write-Host "Veuillez démarrer Docker Desktop et réessayer." -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Docker est en cours d'exécution" -ForegroundColor Green

# Vérifier si l'image existe
Write-Host "`nVérification de l'image..." -ForegroundColor Yellow
$imageExists = docker images | Select-String "vesion_2_enda_crossborder-gestion-reference"
if (-not $imageExists) {
    Write-Host "✗ L'image n'existe pas!" -ForegroundColor Red
    Write-Host "Veuillez construire l'image d'abord avec:" -ForegroundColor Yellow
    Write-Host "  docker-compose build gestion-reference" -ForegroundColor Cyan
    exit 1
}
Write-Host "✓ L'image existe" -ForegroundColor Green

# Arrêter le conteneur s'il existe déjà
Write-Host "`nArrêt du conteneur existant (si présent)..." -ForegroundColor Yellow
docker-compose stop gestion-reference 2>$null
docker-compose rm -f gestion-reference 2>$null

# Lancer le service
Write-Host "`nLancement de gestion-reference..." -ForegroundColor Yellow
docker-compose up -d gestion-reference

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ gestion-reference lancé avec succès!" -ForegroundColor Green
    
    # Attendre quelques secondes
    Write-Host "`nAttente du démarrage (5 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Vérifier l'état
    Write-Host "`nÉtat du service:" -ForegroundColor Cyan
    docker-compose ps gestion-reference
    
    # Afficher les derniers logs
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Derniers logs (20 lignes):" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    docker-compose logs --tail=20 gestion-reference
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Service lancé avec succès!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`nCommandes utiles:" -ForegroundColor Yellow
    Write-Host "  Voir les logs en temps réel : docker-compose logs -f gestion-reference" -ForegroundColor Cyan
    Write-Host "  Arrêter le service          : docker-compose stop gestion-reference" -ForegroundColor Cyan
    Write-Host "  Redémarrer le service       : docker-compose restart gestion-reference" -ForegroundColor Cyan
    Write-Host "  Voir l'état                 : docker-compose ps gestion-reference" -ForegroundColor Cyan
    
} else {
    Write-Host "✗ Échec du lancement!" -ForegroundColor Red
    Write-Host "`nVoir les logs d'erreur:" -ForegroundColor Yellow
    docker-compose logs --tail=50 gestion-reference
}
