# Script pour tester les services qui échouent sur GitHub Actions

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test des Services Problématiques" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Forum_PVVIH
Write-Host "1. Test de Forum_PVVIH (Backend)" -ForegroundColor Yellow
Write-Host "   Path: Forum_PVVIH" -ForegroundColor Gray
Write-Host ""

if (Test-Path "Forum_PVVIH/pom.xml") {
    Write-Host "   Building avec Maven..." -ForegroundColor Gray
    Push-Location Forum_PVVIH
    mvn clean package -DskipTests -B
    $mavenExitCode = $LASTEXITCODE
    Pop-Location
    
    if ($mavenExitCode -eq 0) {
        Write-Host "   ✓ Maven build réussi" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Maven build échoué (Exit code: $mavenExitCode)" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Détails de l'erreur:" -ForegroundColor Yellow
        Push-Location Forum_PVVIH
        mvn clean package -DskipTests -B -X | Select-Object -Last 50
        Pop-Location
    }
} else {
    Write-Host "   ✗ pom.xml non trouvé" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test a_user_front
Write-Host "2. Test de a_user_front (Frontend)" -ForegroundColor Yellow
Write-Host "   Path: a_user_front" -ForegroundColor Gray
Write-Host ""

if (Test-Path "a_user_front/package.json") {
    Write-Host "   Vérification de node_modules..." -ForegroundColor Gray
    
    if (-not (Test-Path "a_user_front/node_modules")) {
        Write-Host "   Installation des dépendances..." -ForegroundColor Gray
        Push-Location a_user_front
        npm ci
        Pop-Location
    }
    
    Write-Host "   Building avec npm..." -ForegroundColor Gray
    Push-Location a_user_front
    npm run build 2>&1 | Tee-Object -Variable buildOutput
    $npmExitCode = $LASTEXITCODE
    Pop-Location
    
    if ($npmExitCode -eq 0) {
        Write-Host "   ✓ npm build réussi" -ForegroundColor Green
    } else {
        Write-Host "   ✗ npm build échoué (Exit code: $npmExitCode)" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Détails de l'erreur:" -ForegroundColor Yellow
        $buildOutput | Select-Object -Last 30
    }
} else {
    Write-Host "   ✗ package.json non trouvé" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fin des Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Recommandations:" -ForegroundColor Yellow
Write-Host "1. Corrigez les erreurs ci-dessus" -ForegroundColor White
Write-Host "2. Testez à nouveau avec ce script" -ForegroundColor White
Write-Host "3. Une fois que tout passe, pushez sur GitHub" -ForegroundColor White
Write-Host ""
