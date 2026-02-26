# Script pour afficher les logs (Windows)
# Usage: .\logs.ps1 [service-name] [-Tail 100]

param(
    [string]$Service = "",
    [int]$Tail = 0
)

if ($Service -eq "") {
    Write-Host "📋 Affichage des logs de tous les services..." -ForegroundColor Cyan
    if ($Tail -gt 0) {
        docker-compose logs -f --tail=$Tail
    } else {
        docker-compose logs -f
    }
} else {
    Write-Host "📋 Affichage des logs de $Service..." -ForegroundColor Cyan
    if ($Tail -gt 0) {
        docker-compose logs -f --tail=$Tail $Service
    } else {
        docker-compose logs -f $Service
    }
}
