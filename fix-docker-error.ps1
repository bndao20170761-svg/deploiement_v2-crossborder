# Script pour corriger l'erreur Docker 500
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Correction Erreur Docker 500" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# 1. Vérifier si Docker Desktop est en cours d'exécution
Write-Host "`n1. Vérification de Docker Desktop..." -ForegroundColor Yellow
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue

if ($dockerProcess) {
    Write-Host "✓ Docker Desktop est en cours d'exécution" -ForegroundColor Green
    
    # Tester la connexion
    Write-Host "`n2. Test de connexion à Docker..." -ForegroundColor Yellow
    $dockerInfo = docker info 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker fonctionne correctement" -ForegroundColor Green
        Write-Host "`nLe problème peut être temporaire. Réessayez votre commande." -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "✗ Docker ne répond pas correctement" -ForegroundColor Red
        Write-Host "Redémarrage de Docker Desktop nécessaire..." -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Docker Desktop n'est pas en cours d'exécution" -ForegroundColor Red
}

# 2. Arrêter Docker Desktop
Write-Host "`n3. Arrêt de Docker Desktop..." -ForegroundColor Yellow
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.backend" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.proxy" -Force -ErrorAction SilentlyContinue

Write-Host "✓ Docker Desktop arrêté" -ForegroundColor Green

# 3. Attendre un peu
Write-Host "`n4. Attente de 10 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Relancer Docker Desktop
Write-Host "`n5. Redémarrage de Docker Desktop..." -ForegroundColor Yellow

$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    Start-Process $dockerPath
    Write-Host "✓ Docker Desktop en cours de démarrage..." -ForegroundColor Green
} else {
    Write-Host "✗ Docker Desktop non trouvé à l'emplacement par défaut" -ForegroundColor Red
    Write-Host "Veuillez démarrer Docker Desktop manuellement" -ForegroundColor Yellow
    exit 1
}

# 5. Attendre que Docker soit prêt
Write-Host "`n6. Attente du démarrage complet de Docker..." -ForegroundColor Yellow
Write-Host "Cela peut prendre 30-60 secondes..." -ForegroundColor Gray

$maxAttempts = 30
$attempt = 0
$dockerReady = $false

while ($attempt -lt $maxAttempts -and -not $dockerReady) {
    Start-Sleep -Seconds 2
    $attempt++
    
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerReady = $true
        Write-Host "✓ Docker est prêt!" -ForegroundColor Green
    } else {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $dockerReady) {
    Write-Host "`n✗ Docker n'est pas prêt après $maxAttempts tentatives" -ForegroundColor Red
    Write-Host "Veuillez attendre encore un peu et vérifier l'icône Docker dans la barre des tâches" -ForegroundColor Yellow
    exit 1
}

# 6. Vérifier les conteneurs
Write-Host "`n7. Vérification des conteneurs..." -ForegroundColor Yellow
docker ps -a

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Docker est maintenant prêt!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nVous pouvez maintenant réessayer votre commande:" -ForegroundColor Yellow
Write-Host "  docker-compose restart gestion-reference" -ForegroundColor Cyan
Write-Host "ou" -ForegroundColor Yellow
Write-Host "  docker-compose up -d gestion-reference" -ForegroundColor Cyan
