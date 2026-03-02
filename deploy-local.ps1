# Script de déploiement local (build + démarrage)

param(
    [switch]$NoBuild = $false,
    [switch]$Stop = $false,
    [switch]$Restart = $false,
    [switch]$Logs = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Déploiement Local" -ForegroundColor Cyan
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

# Arrêter si demandé
if ($Stop) {
    Write-Host ""
    Write-Host "Arrêt de tous les services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.local.yml down
    Write-Host "✓ Services arrêtés" -ForegroundColor Green
    exit 0
}

# Redémarrer si demandé
if ($Restart) {
    Write-Host ""
    Write-Host "Redémarrage des services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.local.yml restart
    Write-Host "✓ Services redémarrés" -ForegroundColor Green
    exit 0
}

# Voir les logs si demandé
if ($Logs) {
    Write-Host ""
    Write-Host "Affichage des logs (Ctrl+C pour quitter)..." -ForegroundColor Yellow
    docker-compose -f docker-compose.local.yml logs -f
    exit 0
}

# Créer le fichier .env
Write-Host ""
Write-Host "Configuration de l'environnement..." -ForegroundColor Yellow
$envContent = @"
MONGO_PASSWORD=admin123
MYSQL_ROOT_PASSWORD=root123
MYSQL_USER_PASSWORD=user123
MYSQL_REFERENCE_PASSWORD=reference123
MYSQL_PATIENT_PASSWORD=patient123
SPRING_PROFILES_ACTIVE=dev
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✓ Fichier .env configuré" -ForegroundColor Green

# Démarrer les services
Write-Host ""
Write-Host "Démarrage des services..." -ForegroundColor Yellow
Write-Host ""

if ($NoBuild) {
    Write-Host "Mode sans build (utilise les images existantes)" -ForegroundColor Gray
    Write-Host ""
}

# Étape 1: Bases de données
Write-Host "1. Démarrage des bases de données..." -ForegroundColor Cyan
docker-compose -f docker-compose.local.yml up -d mongodb mysql-user mysql-reference mysql-patient
Write-Host "   Attente du démarrage (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Étape 2: Service Registry
Write-Host ""
Write-Host "2. Démarrage du Service Registry (Eureka)..." -ForegroundColor Cyan
if ($NoBuild) {
    docker-compose -f docker-compose.local.yml up -d --no-build api-register
} else {
    docker-compose -f docker-compose.local.yml up -d --build api-register
}
Write-Host "   Attente du démarrage (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Étape 3: Config Server
Write-Host ""
Write-Host "3. Démarrage du Config Server..." -ForegroundColor Cyan
if ($NoBuild) {
    docker-compose -f docker-compose.local.yml up -d --no-build api-configuration
} else {
    docker-compose -f docker-compose.local.yml up -d --build api-configuration
}
Write-Host "   Attente du démarrage (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Étape 4: API Gateway
Write-Host ""
Write-Host "4. Démarrage de l'API Gateway..." -ForegroundColor Cyan
if ($NoBuild) {
    docker-compose -f docker-compose.local.yml up -d --no-build gateway-pvvih
} else {
    docker-compose -f docker-compose.local.yml up -d --build gateway-pvvih
}
Write-Host "   Attente du démarrage (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Étape 5: Microservices Métier
Write-Host ""
Write-Host "5. Démarrage des Microservices Métier..." -ForegroundColor Cyan
if ($NoBuild) {
    docker-compose -f docker-compose.local.yml up -d --no-build forum-pvvih gestion-user gestion-reference gestion-patient
} else {
    docker-compose -f docker-compose.local.yml up -d --build forum-pvvih gestion-user gestion-reference gestion-patient
}
Write-Host "   Attente du démarrage (45s)..." -ForegroundColor Gray
Start-Sleep -Seconds 45

# Étape 6: Frontends
Write-Host ""
Write-Host "6. Démarrage des Frontends..." -ForegroundColor Cyan
if ($NoBuild) {
    docker-compose -f docker-compose.local.yml up -d --no-build gestion-forum-front a-reference-front a-user-front
} else {
    docker-compose -f docker-compose.local.yml up -d --build gestion-forum-front a-reference-front a-user-front
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Déploiement terminé!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# État des services
Write-Host "État des services:" -ForegroundColor Cyan
docker-compose -f docker-compose.local.yml ps

Write-Host ""
Write-Host "URLs d'accès:" -ForegroundColor Cyan
Write-Host "  - Eureka:    http://localhost:8761" -ForegroundColor White
Write-Host "  - Gateway:   http://localhost:8080" -ForegroundColor White
Write-Host "  - Forum:     http://localhost:3001" -ForegroundColor White
Write-Host "  - Reference: http://localhost:3002" -ForegroundColor White
Write-Host "  - User:      http://localhost:3003" -ForegroundColor White
Write-Host ""

Write-Host "Commandes utiles:" -ForegroundColor Cyan
Write-Host "  - Voir les logs:  .\deploy-local.ps1 -Logs" -ForegroundColor Gray
Write-Host "  - Redémarrer:     .\deploy-local.ps1 -Restart" -ForegroundColor Gray
Write-Host "  - Arrêter:        .\deploy-local.ps1 -Stop" -ForegroundColor Gray
Write-Host "  - Sans rebuild:   .\deploy-local.ps1 -NoBuild" -ForegroundColor Gray
Write-Host ""
