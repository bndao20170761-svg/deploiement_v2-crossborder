# Script de déploiement depuis Docker Hub

param(
    [string]$DockerHubUsername = "",
    [switch]$Pull = $false,
    [switch]$Stop = $false,
    [switch]$Restart = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Déploiement depuis Docker Hub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Docker
Write-Host "Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "Veuillez démarrer Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Demander le username si non fourni
if ([string]::IsNullOrEmpty($DockerHubUsername)) {
    Write-Host ""
    $DockerHubUsername = Read-Host "Entrez votre username Docker Hub"
    if ([string]::IsNullOrEmpty($DockerHubUsername)) {
        Write-Host "✗ Username requis" -ForegroundColor Red
        exit 1
    }
}

# Créer/mettre à jour .env
Write-Host ""
Write-Host "Configuration de l'environnement..." -ForegroundColor Yellow
$envContent = @"
DOCKERHUB_USERNAME=$DockerHubUsername
MONGO_PASSWORD=admin123
MYSQL_ROOT_PASSWORD=root123
MYSQL_USER_PASSWORD=user123
MYSQL_REFERENCE_PASSWORD=reference123
MYSQL_PATIENT_PASSWORD=patient123
SPRING_PROFILES_ACTIVE=dev
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✓ Fichier .env configuré" -ForegroundColor Green

# Arrêter si demandé
if ($Stop) {
    Write-Host ""
    Write-Host "Arrêt des services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dockerhub.yml down
    Write-Host "✓ Services arrêtés" -ForegroundColor Green
    exit 0
}

# Redémarrer si demandé
if ($Restart) {
    Write-Host ""
    Write-Host "Redémarrage des services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dockerhub.yml restart
    Write-Host "✓ Services redémarrés" -ForegroundColor Green
    exit 0
}

# Pull des images
if ($Pull) {
    Write-Host ""
    Write-Host "Téléchargement des images depuis Docker Hub..." -ForegroundColor Yellow
    
    $services = @(
        "api-register", "api-configuration", "gateway-pvvih",
        "forum-pvvih", "gestion-user", "gestion-reference", "gestion-patient",
        "gestion-forum-front", "a-reference-front", "a-user-front"
    )
    
    foreach ($service in $services) {
        Write-Host "  Pulling $service..." -ForegroundColor Gray
        docker pull "$DockerHubUsername/${service}:latest" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $service" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ $service (pas encore sur Docker Hub)" -ForegroundColor Yellow
        }
    }
}

# Démarrer les services
Write-Host ""
Write-Host "Démarrage des services..." -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Bases de données..." -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml up -d mongodb mysql-user mysql-reference mysql-patient
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "2. Services d'infrastructure..." -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml up -d api-register
Start-Sleep -Seconds 30

docker-compose -f docker-compose.dockerhub.yml up -d api-configuration
Start-Sleep -Seconds 30

docker-compose -f docker-compose.dockerhub.yml up -d gateway-pvvih
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "3. Microservices métier..." -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml up -d forum-pvvih gestion-user gestion-reference gestion-patient
Start-Sleep -Seconds 45

Write-Host ""
Write-Host "4. Frontends..." -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml up -d gestion-forum-front a-reference-front a-user-front

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Déploiement terminé!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# État des services
Write-Host "État des services:" -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml ps

Write-Host ""
Write-Host "URLs d'accès:" -ForegroundColor Cyan
Write-Host "  - Eureka:    http://localhost:8761" -ForegroundColor White
Write-Host "  - Gateway:   http://localhost:8080" -ForegroundColor White
Write-Host "  - Forum:     http://localhost:3001" -ForegroundColor White
Write-Host "  - Reference: http://localhost:3002" -ForegroundColor White
Write-Host "  - User:      http://localhost:3003" -ForegroundColor White
Write-Host ""
