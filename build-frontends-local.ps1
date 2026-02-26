# Script pour construire les frontends localement (plus rapide)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Construction Locale des Frontends" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$frontends = @(
    @{Name="a-reference-front"; Path="a_reference_front"},
    @{Name="a-user-front"; Path="a_user_front"},
    @{Name="gestion-forum-front"; Path="gestion_forum_front"}
)

foreach ($frontend in $frontends) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Construction de $($frontend.Name)" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    
    $path = $frontend.Path
    
    if (-not (Test-Path $path)) {
        Write-Host "✗ Dossier $path non trouvé!" -ForegroundColor Red
        continue
    }
    
    Push-Location $path
    
    # Installer les dépendances si nécessaire
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installation des dépendances..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Échec de l'installation" -ForegroundColor Red
            Pop-Location
            continue
        }
    }
    
    # Construire
    Write-Host "Construction du build de production..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $($frontend.Name) construit avec succès" -ForegroundColor Green
    } else {
        Write-Host "✗ Échec de la construction de $($frontend.Name)" -ForegroundColor Red
    }
    
    Pop-Location
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Construction locale terminée!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nMaintenant, créez des Dockerfiles simplifiés qui copient juste les builds" -ForegroundColor Yellow
Write-Host "Ou utilisez les builds existants dans les dossiers 'build'" -ForegroundColor Yellow
