# Script de réinitialisation complète de Docker Desktop
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Réinitialisation Complète Docker" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n⚠️  ATTENTION : Cette opération va :" -ForegroundColor Yellow
Write-Host "  - Arrêter tous les conteneurs" -ForegroundColor Red
Write-Host "  - Supprimer toutes les images" -ForegroundColor Red
Write-Host "  - Supprimer tous les volumes" -ForegroundColor Red
Write-Host "  - Réinitialiser Docker Desktop" -ForegroundColor Red

$confirmation = Read-Host "`nVoulez-vous continuer ? (oui/non)"
if ($confirmation -ne "oui") {
    Write-Host "Opération annulée." -ForegroundColor Yellow
    exit
}

# 1. Arrêter Docker Desktop
Write-Host "`n1. Arrêt de Docker Desktop..." -ForegroundColor Yellow
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.backend" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.proxy" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "vpnkit" -Force -ErrorAction SilentlyContinue

Write-Host "✓ Docker Desktop arrêté" -ForegroundColor Green
Start-Sleep -Seconds 5

# 2. Nettoyer les données Docker
Write-Host "`n2. Nettoyage des données Docker..." -ForegroundColor Yellow

$dockerDataPath = "$env:LOCALAPPDATA\Docker"
$dockerProgramData = "$env:ProgramData\Docker"

if (Test-Path $dockerDataPath) {
    Write-Host "  Nettoyage de $dockerDataPath..." -ForegroundColor Gray
    Remove-Item -Path "$dockerDataPath\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Nettoyé" -ForegroundColor Green
}

# 3. Relancer Docker Desktop
Write-Host "`n3. Redémarrage de Docker Desktop..." -ForegroundColor Yellow
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

if (Test-Path $dockerPath) {
    Start-Process $dockerPath
    Write-Host "✓ Docker Desktop en cours de démarrage..." -ForegroundColor Green
} else {
    Write-Host "✗ Docker Desktop non trouvé!" -ForegroundColor Red
    exit 1
}

# 4. Attendre le démarrage
Write-Host "`n4. Attente du démarrage complet..." -ForegroundColor Yellow
Write-Host "Cela peut prendre 2-3 minutes..." -ForegroundColor Gray

$maxAttempts = 60
$attempt = 0
$dockerReady = $false

while ($attempt -lt $maxAttempts -and -not $dockerReady) {
    Start-Sleep -Seconds 3
    $attempt++
    
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerReady = $true
        Write-Host "`n✓ Docker est prêt!" -ForegroundColor Green
    } else {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $dockerReady) {
    Write-Host "`n⚠️  Docker n'est pas encore prêt" -ForegroundColor Yellow
    Write-Host "Veuillez attendre encore 1-2 minutes et vérifier l'icône Docker" -ForegroundColor Yellow
    Write-Host "Puis exécutez : docker info" -ForegroundColor Cyan
} else {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Docker réinitialisé avec succès!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    
    Write-Host "`nVous devez maintenant reconstruire vos images:" -ForegroundColor Yellow
    Write-Host "  docker-compose build" -ForegroundColor Cyan
}
