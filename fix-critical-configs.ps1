# Script pour corriger les configurations critiques dans le dépôt Git
# Ce script corrige automatiquement les deux problèmes identifiés

$configRepoPath = "C:\Users\babac\cloud-config-repo\cloud-config-repo-enda"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Correction des Configurations Critiques" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le dépôt existe
if (-not (Test-Path $configRepoPath)) {
    Write-Host "❌ ERREUR: Le dépôt n'existe pas à: $configRepoPath" -ForegroundColor Red
    exit 1
}

Set-Location $configRepoPath
Write-Host "📁 Dépôt: $configRepoPath" -ForegroundColor Green
Write-Host ""

# ============================================================
# CORRECTION 1: Forum_API_PVVIH-dev.properties
# ============================================================
Write-Host "🔧 Correction 1: Forum_API_PVVIH-dev.properties" -ForegroundColor Yellow
$forumFile = Join-Path $configRepoPath "Forum_API_PVVIH-dev.properties"

if (Test-Path $forumFile) {
    $content = Get-Content $forumFile -Raw
    
    # Vérifier si gestion.user.url manque http://
    if ($content -match "gestion\.user\.url=gestion-user:8080") {
        Write-Host "   ⚠️  Trouvé: gestion.user.url=gestion-user:8080 (manque http://)" -ForegroundColor Yellow
        $content = $content -replace "gestion\.user\.url=gestion-user:8080", "gestion.user.url=http://gestion-user:8080"
        Set-Content -Path $forumFile -Value $content -NoNewline
        Write-Host "   ✅ Corrigé: gestion.user.url=http://gestion-user:8080" -ForegroundColor Green
    } elseif ($content -match "gestion\.user\.url=http://gestion-user:8080") {
        Write-Host "   ✅ Déjà correct: gestion.user.url=http://gestion-user:8080" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Configuration gestion.user.url non trouvée ou format différent" -ForegroundColor Yellow
    }
    
    # Vérifier app.jwt.secret
    if ($content -match "app\.jwt\.secret=") {
        Write-Host "   ✅ app.jwt.secret présent" -ForegroundColor Green
    } else {
        Write-Host "   ❌ app.jwt.secret MANQUANT!" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Fichier non trouvé: $forumFile" -ForegroundColor Red
}

Write-Host ""

# ============================================================
# CORRECTION 2: GETWAY_PVVIH-dev.yaml
# ============================================================
Write-Host "🔧 Correction 2: GETWAY_PVVIH-dev.yaml" -ForegroundColor Yellow
$gatewayFile = Join-Path $configRepoPath "GETWAY_PVVIH-dev.yaml"

if (Test-Path $gatewayFile) {
    $lines = Get-Content $gatewayFile
    $modified = $false
    $newLines = @()
    
    foreach ($line in $lines) {
        # Supprimer la ligne spring.cloud.config.enabled: false
        if ($line -match "^\s*enabled:\s*false\s*$" -and $newLines[-1] -match "config:") {
            Write-Host "   ⚠️  Trouvé et SUPPRIMÉ: spring.cloud.config.enabled: false" -ForegroundColor Yellow
            $modified = $true
            continue
        }
        $newLines += $line
    }
    
    if ($modified) {
        Set-Content -Path $gatewayFile -Value $newLines
        Write-Host "   ✅ Fichier corrigé: spring.cloud.config.enabled supprimé" -ForegroundColor Green
    } else {
        # Vérifier si la ligne problématique existe
        $hasConfigEnabled = $lines | Where-Object { $_ -match "enabled:\s*false" }
        if ($hasConfigEnabled) {
            Write-Host "   ⚠️  La ligne 'enabled: false' existe mais n'a pas été supprimée automatiquement" -ForegroundColor Yellow
            Write-Host "   📝 Vérification manuelle requise" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ Déjà correct: pas de spring.cloud.config.enabled: false" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   ❌ Fichier non trouvé: $gatewayFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Résumé des Corrections" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Afficher le statut Git
Write-Host "📊 Statut Git:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prochaines Étapes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Vérifiez les modifications ci-dessus" -ForegroundColor White
Write-Host "2. Si tout est correct, exécutez:" -ForegroundColor White
Write-Host ""
Write-Host "   git add ." -ForegroundColor Green
Write-Host "   git commit -m 'Fix: Ajout http:// dans gestion.user.url et suppression config.enabled'" -ForegroundColor Green
Write-Host "   git push origin main" -ForegroundColor Green
Write-Host ""
Write-Host "3. Puis redémarrez les services:" -ForegroundColor White
Write-Host ""
Write-Host "   docker-compose restart api-configuration" -ForegroundColor Green
Write-Host "   Start-Sleep -Seconds 15" -ForegroundColor Green
Write-Host "   docker-compose restart forum-pvvih gestion-user gateway-pvvih" -ForegroundColor Green
Write-Host ""
