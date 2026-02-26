# Script pour afficher les logs des services Docker
param(
    [Parameter(Mandatory=$false)]
    [string]$Service = "",
    
    [Parameter(Mandatory=$false)]
    [int]$Lignes = 100,
    
    [Parameter(Mandatory=$false)]
    [switch]$Suivre
)

$services = @(
    "api-configuration",
    "api-register",
    "gateway-pvvih",
    "gestion-reference",
    "gestion-patient",
    "gestion-user",
    "forum-pvvih",
    "a-reference-front",
    "a-user-front",
    "gestion-forum-front"
)

function Show-Menu {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   Affichage des Logs Docker" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    for ($i = 0; $i -lt $services.Count; $i++) {
        Write-Host "  $($i + 1). $($services[$i])" -ForegroundColor White
    }
    
    Write-Host "`n  0. Tous les services" -ForegroundColor Green
    Write-Host "  Q. Quitter" -ForegroundColor Red
    Write-Host ""
}

function Show-Logs {
    param(
        [string]$ServiceName,
        [int]$Lines,
        [bool]$Follow
    )
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Logs de : $ServiceName" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Appuyez sur Ctrl+C pour arrêter`n" -ForegroundColor Gray
    
    if ($Follow) {
        docker-compose logs -f --tail=$Lines $ServiceName
    } else {
        docker-compose logs --tail=$Lines $ServiceName
    }
}

# Si un service est spécifié en paramètre
if ($Service -ne "") {
    if ($services -contains $Service) {
        Show-Logs -ServiceName $Service -Lines $Lignes -Follow $Suivre
    } else {
        Write-Host "Service '$Service' non trouvé!" -ForegroundColor Red
        Write-Host "Services disponibles : $($services -join ', ')" -ForegroundColor Yellow
    }
    exit
}

# Menu interactif
while ($true) {
    Show-Menu
    $choix = Read-Host "Choisissez un service (1-$($services.Count), 0 pour tous, Q pour quitter)"
    
    if ($choix -eq "Q" -or $choix -eq "q") {
        Write-Host "`nAu revoir!" -ForegroundColor Green
        break
    }
    
    if ($choix -eq "0") {
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "Logs de TOUS les services" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Appuyez sur Ctrl+C pour arrêter`n" -ForegroundColor Gray
        docker-compose logs -f --tail=$Lignes
        continue
    }
    
    $index = [int]$choix - 1
    if ($index -ge 0 -and $index -lt $services.Count) {
        $selectedService = $services[$index]
        
        Write-Host "`nOptions d'affichage:" -ForegroundColor Cyan
        Write-Host "  1. Afficher les $Lignes dernières lignes" -ForegroundColor White
        Write-Host "  2. Suivre en temps réel (Ctrl+C pour arrêter)" -ForegroundColor White
        Write-Host "  3. Afficher tout l'historique" -ForegroundColor White
        
        $option = Read-Host "`nChoisissez une option (1-3)"
        
        switch ($option) {
            "1" {
                Show-Logs -ServiceName $selectedService -Lines $Lignes -Follow $false
            }
            "2" {
                Show-Logs -ServiceName $selectedService -Lines $Lignes -Follow $true
            }
            "3" {
                Show-Logs -ServiceName $selectedService -Lines 999999 -Follow $false
            }
            default {
                Write-Host "Option invalide!" -ForegroundColor Red
            }
        }
        
        Write-Host "`nAppuyez sur Entrée pour continuer..." -ForegroundColor Gray
        Read-Host
    } else {
        Write-Host "Choix invalide!" -ForegroundColor Red
        Start-Sleep -Seconds 1
    }
}
