# Script de démarrage du système microservices PVVIH (Windows)
# Usage: .\start.ps1 [dev|prod]

param(
    [string]$Mode = "dev"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Démarrage du système microservices PVVIH" -ForegroundColor Cyan
Write-Host "Mode: $Mode" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Vérifier que Docker est installé
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier que Docker Compose est installé
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier .env existe
if (-not (Test-Path .env)) {
    Write-Host "⚠️  Fichier .env non trouvé" -ForegroundColor Yellow
    Write-Host "📝 Création du fichier .env depuis .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Fichier .env créé. Veuillez le configurer avant de continuer." -ForegroundColor Green
    exit 0
}

# Arrêter les conteneurs existants
Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose down

# Construire les images
Write-Host "🔨 Construction des images Docker..." -ForegroundColor Yellow
if ($Mode -eq "prod") {
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
} else {
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
}

# Démarrer les services
Write-Host "🚀 Démarrage des services..." -ForegroundColor Yellow
if ($Mode -eq "prod") {
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
} else {
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
}

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier l'état des services
Write-Host ""
Write-Host "📊 État des services:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Système démarré avec succès!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Accès aux services:" -ForegroundColor Cyan
Write-Host "  - Forum Frontend:     http://localhost:3001"
Write-Host "  - Reference Frontend: http://localhost:3002"
Write-Host "  - User Frontend:      http://localhost:3003"
Write-Host "  - API Gateway:        http://localhost:8080"
Write-Host "  - Eureka Dashboard:   http://localhost:8761"
Write-Host "  - Config Server:      http://localhost:8888"
Write-Host ""
Write-Host "📝 Commandes utiles:" -ForegroundColor Cyan
Write-Host "  - Voir les logs:      docker-compose logs -f"
Write-Host "  - Arrêter:            docker-compose down"
Write-Host "  - Redémarrer:         docker-compose restart"
Write-Host ""
