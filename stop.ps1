# Script d'arrêt du système microservices PVVIH (Windows)
# Usage: .\stop.ps1 [-Volumes]

param(
    [switch]$Volumes
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Arrêt du système microservices PVVIH" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if ($Volumes) {
    Write-Host "🗑️  Suppression des volumes..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✅ Services arrêtés et volumes supprimés" -ForegroundColor Green
} else {
    docker-compose down
    Write-Host "✅ Services arrêtés (volumes conservés)" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Conteneurs restants:" -ForegroundColor Cyan
$containers = docker ps -a | Select-String "pvvih"
if ($containers) {
    docker ps -a | Select-String "pvvih"
} else {
    Write-Host "Aucun conteneur PVVIH en cours d'exécution"
}
Write-Host ""
