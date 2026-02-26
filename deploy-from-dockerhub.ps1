# Script de déploiement depuis Docker Hub
# Ce script pull les images depuis Docker Hub et démarre les services

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

# Vérifier si Docker est en cours d'exécution
Write-Host "Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "Veuillez démarrer Docker Desktop et réessayer" -ForegroundColor Yellow
    exit 1
}

# Demander le username Docker Hub si non fourni
if ([string]::IsNullOrEmpty($DockerHubUsername)) {
    Write-Host ""
    $DockerHubUsername = Read-Host "Entrez votre username Docker Hub"
    if ([string]::IsNullOrEmpty($DockerHubUsername)) {
        Write-Host "✗ Username requis" -ForegroundColor Red
        exit 1
    }
}

# Créer/mettre à jour le fichier .env
Write-Host ""
Write-Host "Configuration de l'environnement..." -ForegroundColor Yellow
$envContent = @"
# Docker Hub Configuration
DOCKERHUB_USERNAME=$DockerHubUsername

# Database Passwords
MONGO_PASSWORD=admin123
MYSQL_ROOT_PASSWORD=root123
MYSQL_USER_PASSWORD=user123
MYSQL_REFERENCE_PASSWORD=reference123
MYSQL_PATIENT_PASSWORD=patient123

# Spring Profile
SPRING_PROFILES_ACTIVE=dev
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✓ Fichier .env configuré" -ForegroundColor Green

# Arrêter les services si demandé
if ($Stop) {
    Write-Host ""
    Write-Host "Arrêt des services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dockerhub.yml down
    Write-Host "✓ Services arrêtés" -ForegroundColor Green
    exit 0
}

# Redémarrer les services si demandé
if ($Restart) {
    Write-Host ""
    Write-Host "Redémarrage des services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dockerhub.yml restart
    Write-Host "✓ Services redémarrés" -ForegroundColor Green
    exit 0
}

# Pull des images depuis Docker Hub
if ($Pull) {
    Write-Host ""
    Write-Host "Téléchargement des images depuis Docker Hub..." -ForegroundColor Yellow
    Write-Host "Cela peut prendre plusieurs minutes..." -ForegroundColor Gray
    
    $services = @(
        "api-register",
        "api-configuration",
        "gateway-pvvih",
        "forum-pvvih",
        "gestion-user",
        "gestion-reference",
        "gestion-patient",
        "gestion-forum-front",
        "a-reference-front",
        "a-user-front"
    )
    
    foreach ($service in $services) {
        Write-Host "  Pulling $service..." -ForegroundColor Gray
        docker pull "$DockerHubUsername/${service}:latest"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $service téléchargé" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Erreur lors du téléchargement de $service" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "✓ Toutes les images ont été téléchargées" -ForegroundColor Green
}

# Démarrer les services
Write-Host ""
Write-Host "Démarrage des services..." -ForegroundColor Yellow
Write-Host ""

# Démarrer les bases de données d'abord
Write-Host "1. Démarrage des bases de données..." -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml up -d mongodb mysql-user mysql-reference mysql-patient

Write-Host "   Attente du démarrage des bases de données (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Démarrer les services d'infrastructure
Write-Host ""
Write-Host "2. Démarrage des services d'infrastructure..." -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml up -d api-register

Write-Host "   Attente du démarrage d'Eureka (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

docker-compose -f docker-compose.dockerhub.yml up -d api-configuration

Write-Host "   Attente du démarrage du Config Server (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

docker-compose -f docker-compose.dockerhub.yml up -d gateway-pvvih

Write-Host "   Attente du démarrage de la Gateway (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Démarrer les microservices métier
Write-Host ""
Write-Host "3. Démarrage des microservices métier..." -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml up -d forum-pvvih gestion-user gestion-reference gestion-patient

Write-Host "   Attente du démarrage des microservices (45s)..." -ForegroundColor Gray
Start-Sleep -Seconds 45

# Démarrer les frontends
Write-Host ""
Write-Host "4. Démarrage des frontends..." -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml up -d gestion-forum-front a-reference-front a-user-front

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Déploiement terminé!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Afficher l'état des services
Write-Host "État des services:" -ForegroundColor Cyan
docker-compose -f docker-compose.dockerhub.yml ps

Write-Host ""
Write-Host "URLs d'accès:" -ForegroundColor Cyan
Write-Host "  - Eureka Dashboard:    http://localhost:8761" -ForegroundColor White
Write-Host "  - API Gateway:         http://localhost:8080" -ForegroundColor White
Write-Host "  - Forum Frontend:      http://localhost:3001" -ForegroundColor White
Write-Host "  - Reference Frontend:  http://localhost:3002" -ForegroundColor White
Write-Host "  - User Frontend:       http://localhost:3003" -ForegroundColor White
Write-Host ""

Write-Host "Commandes utiles:" -ForegroundColor Cyan
Write-Host "  - Voir les logs:       docker-compose -f docker-compose.dockerhub.yml logs -f [service]" -ForegroundColor Gray
Write-Host "  - Arrêter:             .\deploy-from-dockerhub.ps1 -Stop" -ForegroundColor Gray
Write-Host "  - Redémarrer:          .\deploy-from-dockerhub.ps1 -Restart" -ForegroundColor Gray
Write-Host "  - Pull + Démarrer:     .\deploy-from-dockerhub.ps1 -Pull -DockerHubUsername votre-username" -ForegroundColor Gray
Write-Host ""
