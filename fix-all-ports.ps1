# Script pour corriger TOUS les ports 8081 -> 8080 dans les frontends
# Exécuter avec: powershell -ExecutionPolicy Bypass -File .\fix-all-ports.ps1

Write-Host "🔧 Correction de tous les ports 8081 -> 8080..." -ForegroundColor Cyan

$folders = @("a_reference_front", "a_user_front", "gestion_forum_front")
$extensions = @("*.js", "*.jsx", "*.ts", "*.tsx")

$totalFixed = 0

foreach ($folder in $folders) {
    Write-Host "`n📁 Traitement du dossier: $folder" -ForegroundColor Yellow
    
    foreach ($ext in $extensions) {
        $files = Get-ChildItem -Path $folder -Recurse -Include $ext -ErrorAction SilentlyContinue
        
        foreach ($file in $files) {
            try {
                $content = Get-Content $file.FullName -Raw -ErrorAction Stop
                $newContent = $content -replace 'localhost:8081', 'localhost:8080'
                
                if ($content -ne $newContent) {
                    Set-Content $file.FullName -Value $newContent -NoNewline
                    Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
                    $totalFixed++
                }
            } catch {
                Write-Host "  ⚠️  Erreur sur $($file.Name): $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`n✨ Terminé! $totalFixed fichier(s) corrigé(s)" -ForegroundColor Cyan

Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Reconstruire les frontends:" -ForegroundColor White
Write-Host "   docker-compose build a-reference-front a-user-front gestion-forum-front --no-cache" -ForegroundColor Gray
Write-Host "`n2. Redémarrer les frontends:" -ForegroundColor White
Write-Host "   docker-compose up -d a-reference-front a-user-front gestion-forum-front" -ForegroundColor Gray
Write-Host "`n3. Vérifier les logs:" -ForegroundColor White
Write-Host "   docker-compose logs -f a-reference-front a-user-front gestion-forum-front" -ForegroundColor Gray
