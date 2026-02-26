# Script pour lancer tous les services
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Lancement de Tous les Services" -ForegroundColor Yellow
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

# Ordre de démarrage des services
$services = @(
    @{Name="api-configuration"; Description="Serveur de Configuration"},
    @{Name="api-register"; Description="Serveur Eureka"},
    @{Name="gateway-pvvih"; Description="Gateway API"},
    @{Name="gestion-reference"; Description="Service Gestion Référence"},
    @{Name="gestion-patient"; Description="Service Gestion Patient"},
    @{Name="gestion-user"; Description="Service Gestion Utilisateur"},
    @{Name="forum-pvvih"; Description="Service Forum"},
    @{Name="a-reference-front"; Description="Frontend Référence"},
    @{Name="a-user-front"; Description="Frontend Utilisateur"},
    @{Name="gestion-forum-front"; Description="Frontend Forum"}
)

Write-Host "`nArrêt des services existants..." -ForegroundColor Yellow
docker-compose down 2>$null

Write-Host "`nLancement des services dans l'ordre..." -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "Démarrage de $($service.Description) ($($service.Name))..." -ForegroundColor Cyan
    docker-compose up -d $service.Name
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $($service.Name) démarré" -ForegroundColor Green
        
        # Attendre un peu entre les services critiques
        if ($service.Name -in @("api-configuration", "api-register", "gateway-pvvih")) {
            Write-Host "  Attente de stabilisation (10 secondes)..." -ForegroundColor Gray
            Start-Sleep -Seconds 10
        } else {
            Start-Sleep -Seconds 2
        }
    } else {
        Write-Host "  ✗ Échec du démarrage de $($service.Name)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "État de tous les services:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Vérification de la santé des services..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$runningServices = docker-compose ps --services --filter "status=running"
$totalServices = $services.Count
$runningCount = ($runningServices | Measure-Object).Count

Write-Host "`nServices en cours d'exécution: $runningCount / $totalServices" -ForegroundColor $(if ($runningCount -eq $totalServices) { "Green" } else { "Yellow" })

if ($runningCount -lt $totalServices) {
    Write-Host "`nServices qui ne sont pas démarrés:" -ForegroundColor Red
    foreach ($service in $services) {
        if ($service.Name -notin $runningServices) {
            Write-Host "  ✗ $($service.Name)" -ForegroundColor Red
        }
    }
    
    Write-Host "`nPour voir les logs d'un service:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs <nom-du-service>" -ForegroundColor Cyan
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Voir tous les logs          : docker-compose logs -f" -ForegroundColor Cyan
Write-Host "  Voir logs d'un service      : docker-compose logs -f <service>" -ForegroundColor Cyan
Write-Host "  Arrêter tous les services   : docker-compose down" -ForegroundColor Cyan
Write-Host "  Redémarrer un service       : docker-compose restart <service>" -ForegroundColor Cyan
Write-Host "  Voir l'état                 : docker-compose ps" -ForegroundColor Cyan
Write-Host "  Script de vérification      : .\verify-setup.ps1" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "URLs d'accès:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Frontend Référence  : http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Frontend Utilisateur: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Frontend Forum      : http://localhost:3002" -ForegroundColor Cyan
Write-Host "  Gateway API         : http://localhost:8888" -ForegroundColor Cyan
Write-Host "  Eureka Dashboard    : http://localhost:8761" -ForegroundColor Cyan
Write-Host "  Config Server       : http://localhost:9999" -ForegroundColor Cyan
