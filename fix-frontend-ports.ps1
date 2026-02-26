# Script pour corriger tous les ports 8081 en 8080 dans les frontends

Write-Host "🔧 Correction des ports 8081 -> 8080 dans les frontends..." -ForegroundColor Cyan

$files = @(
    "a_user_front/src/config/microservices.js",
    "a_user_front/src/assets/components/HospitalForm.js",
    "a_user_front/src/assets/components/Header.js",
    "a_user_front/src/assets/components/CartographyMap.js",
    "a_reference_front/src/components/DossierViewEnhanced.js",
    "a_reference_front/src/components/referenceService.js",
    "a_reference_front/src/components/ReferenceWizard.js",
    "a_reference_front/src/components/PatientView.js",
    "a_reference_front/src/components/HopitalMap.js",
    "a_reference_front/src/components/HopitalList.js",
    "a_reference_front/src/components/FormulaireMultiEtapes.js",
    "a_reference_front/src/components/Header.js",
    "a_reference_front/src/components/FormulaireCompletFusionne.js",
    "a_reference_front/src/components/DossierView.js",
    "a_reference_front/src/components/AdvancedSearch.js"
)

$count = 0
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $newContent = $content -replace 'localhost:8081', 'localhost:8080'
        
        if ($content -ne $newContent) {
            Set-Content $file -Value $newContent -NoNewline
            Write-Host "✅ Corrigé: $file" -ForegroundColor Green
            $count++
        } else {
            Write-Host "⏭️  Aucun changement: $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Fichier introuvable: $file" -ForegroundColor Red
    }
}

Write-Host "`n✨ Terminé! $count fichier(s) corrigé(s)" -ForegroundColor Cyan
Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Reconstruire les frontends:" -ForegroundColor White
Write-Host "   docker-compose build a-reference-front a-user-front --no-cache" -ForegroundColor Gray
Write-Host "2. Redémarrer les frontends:" -ForegroundColor White
Write-Host "   docker-compose up -d a-reference-front a-user-front" -ForegroundColor Gray
