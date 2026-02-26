# Script de déploiement et vérification complète
# Ce script démarre les services Docker et vérifie que tout fonctionne correctement

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Déploiement Microservices PVVIH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Arrêter les services existants
Write-Host "Étape 1: Arrêt des services existants..." -ForegroundColor Yellow
docker-compose down
Write-Host "  Services arrêtés" -ForegroundColor Green
Write-Host ""

# Étape 2: Reconstruire les images
Write-Host "Étape 2: Reconstruction des images Docker..." -ForegroundColor Yellow
Write-Host "  (Cela peut prendre plusieurs minutes)" -ForegroundColor Gray
docker-compose build --no-cache api-configuration
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERREUR lors de la construction du Config Server" -ForegroundColor Red
    exit 1
}
Write-Host "  Config Server reconstruit avec succès" -ForegroundColor Green
Write-Host ""

# Étape 3: Démarrer les services
Write-Host "Étape 3: Démarrage des services..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERREUR lors du démarrage des services" -ForegroundColor Red
    exit 1
}
Write-Host "  Services démarrés" -ForegroundColor Green
Write-Host ""

# Étape 4: Attendre que le Config Server soit prêt
Write-Host "Étape 4: Attente du démarrage du Config Server..." -ForegroundColor Yellow
Write-Host "  (Le Config Server doit cloner le dépôt GitHub)" -ForegroundColor Gray

$maxAttempts = 30
$attempt = 0
$configServerReady = $false

while ($attempt -lt $maxAttempts -and -not $configServerReady) {
    $attempt++
    Write-Host "  Tentative $attempt/$maxAttempts..." -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8888/actuator/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.status -eq "UP") {
            $configServerReady = $true
            Write-Host "  Config Server est prêt!" -ForegroundColor Green
        }
    }
    catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $configServerReady) {
    Write-Host "  ERREUR: Le Config Server n'a pas démarré dans le temps imparti" -ForegroundColor Red
    Write-Host "  Vérifiez les logs: docker logs api-configuration" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Étape 5: Vérifier que le Config Server peut servir les configurations
Write-Host "Étape 5: Vérification des configurations..." -ForegroundColor Yellow

$services = @("Forum_API_PVVIH", "Patient_API_PVVIH", "Reference_API_PVVIH", "User_API_PVVIH", "GETWAY_PVVIH")
$allConfigsOk = $true

foreach ($service in $services) {
    $endpoint = "http://localhost:8888/$service/dev"
    Write-Host "  Vérification: $service" -ForegroundColor Gray
    
    try {
        $config = Invoke-RestMethod -Uri $endpoint -TimeoutSec 10 -ErrorAction Stop
        if ($config.propertySources -and $config.propertySources.Count -gt 0) {
            Write-Host "    OK - Configuration chargée" -ForegroundColor Green
        }
        else {
            Write-Host "    ERREUR - Aucune source de propriétés" -ForegroundColor Red
            $allConfigsOk = $false
        }
    }
    catch {
        Write-Host "    ERREUR - Impossible de charger la configuration" -ForegroundColor Red
        $allConfigsOk = $false
    }
}

if (-not $allConfigsOk) {
    Write-Host ""
    Write-Host "  ATTENTION: Certaines configurations ne sont pas disponibles" -ForegroundColor Red
    Write-Host "  Vérifiez que les fichiers existent dans le dépôt GitHub:" -ForegroundColor Yellow
    Write-Host "  https://github.com/BabacarNdaoKgl/cloud-config-repo-enda" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Logs du Config Server:" -ForegroundColor Yellow
    docker logs api-configuration --tail 20
    exit 1
}

Write-Host "  Toutes les configurations sont disponibles!" -ForegroundColor Green
Write-Host ""

# Étape 6: Redémarrer les microservices pour qu'ils chargent les configurations
Write-Host "Étape 6: Redémarrage des microservices..." -ForegroundColor Yellow
docker-compose restart forum-pvvih gestion-user gestion-patient gestion-reference gateway-pvvih
Write-Host "  Microservices redémarrés" -ForegroundColor Green
Write-Host ""

# Étape 7: Attendre et vérifier les services
Write-Host "Étape 7: Vérification du démarrage des services..." -ForegroundColor Yellow
Write-Host "  (Attente de 30 secondes pour le démarrage)" -ForegroundColor Gray
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "  État des services:" -ForegroundColor Gray
docker-compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Déploiement terminé!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services disponibles:" -ForegroundColor Green
Write-Host "  - Eureka (Service Registry): http://localhost:8761" -ForegroundColor White
Write-Host "  - Config Server: http://localhost:8888" -ForegroundColor White
Write-Host "  - API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "  - Forum Service: http://localhost:9092" -ForegroundColor White
Write-Host "  - User Service: http://localhost:9089" -ForegroundColor White
Write-Host "  - Patient Service: http://localhost:9091" -ForegroundColor White
Write-Host "  - Reference Service: http://localhost:9090" -ForegroundColor White
Write-Host "  - Forum Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "  - Reference Frontend: http://localhost:3002" -ForegroundColor White
Write-Host "  - User Frontend: http://localhost:3003" -ForegroundColor White
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "  - Voir tous les logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  - Voir logs d'un service: docker logs <nom-service> -f" -ForegroundColor White
Write-Host "  - Arrêter tout: docker-compose down" -ForegroundColor White
Write-Host "  - Redémarrer un service: docker-compose restart <nom-service>" -ForegroundColor White
Write-Host ""
Write-Host "Pour vérifier les erreurs éventuelles:" -ForegroundColor Yellow
Write-Host "  docker-compose logs forum-pvvih | Select-String -Pattern 'error|exception' -CaseSensitive:`$false" -ForegroundColor White
Write-Host ""
