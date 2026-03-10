# Script de vérification rapide de l'IP dans tous les fichiers

$nouvelleIP = "34.32.116.206"
$ancienneIP = "34.133.155.230"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Vérification IP GCP                                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Nouvelle IP attendue: " -NoNewline
Write-Host $nouvelleIP -ForegroundColor Green
Write-Host ""

# Fonction pour vérifier un fichier
function Test-IPInFile {
    param($filePath, $fileName)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $hasNew = $content -match $nouvelleIP
        $hasOld = $content -match $ancienneIP
        
        if ($hasNew -and -not $hasOld) {
            Write-Host "  ✅ $fileName" -ForegroundColor Green
            return $true
        } elseif ($hasOld) {
            Write-Host "  ❌ $fileName (contient encore l'ancienne IP)" -ForegroundColor Red
            return $false
        } else {
            Write-Host "  ⚠️  $fileName (aucune IP trouvée)" -ForegroundColor Yellow
            return $true
        }
    } else {
        Write-Host "  ⚠️  $fileName (fichier introuvable)" -ForegroundColor Yellow
        return $false
    }
}

# Vérifier les fichiers principaux
Write-Host "Configuration Backend:" -ForegroundColor Cyan
$result1 = Test-IPInFile ".env" ".env"
$result2 = Test-IPInFile ".env.gcp.example" ".env.gcp.example"

Write-Host ""
Write-Host "Frontends:" -ForegroundColor Cyan
$result3 = Test-IPInFile "gestion_forum_front/.env" "gestion_forum_front/.env"
$result4 = Test-IPInFile "a_reference_front/.env" "a_reference_front/.env"
$result5 = Test-IPInFile "a_user_front/.env" "a_user_front/.env"

Write-Host ""
Write-Host "Scripts:" -ForegroundColor Cyan
$result6 = Test-IPInFile "setup-nouvelle-instance-gcp.sh" "setup-nouvelle-instance-gcp.sh"
$result7 = Test-IPInFile "deploy-gcp-complet.sh" "deploy-gcp-complet.sh"

Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
$result8 = Test-IPInFile "DEPLOIEMENT_GCP_GUIDE.md" "DEPLOIEMENT_GCP_GUIDE.md"
$result9 = Test-IPInFile "NOUVELLE_INSTANCE_GCP.md" "NOUVELLE_INSTANCE_GCP.md"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Résumé
$allResults = @($result1, $result2, $result3, $result4, $result5, $result6, $result7, $result8, $result9)
$successCount = ($allResults | Where-Object { $_ -eq $true }).Count
$totalCount = $allResults.Count

Write-Host ""
if ($successCount -eq $totalCount) {
    Write-Host "✅ VÉRIFICATION RÉUSSIE!" -ForegroundColor Green
    Write-Host "Tous les fichiers ($successCount/$totalCount) sont correctement configurés avec la nouvelle IP." -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaine étape: Exécutez .\push-nouvelle-ip-gcp.ps1" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  ATTENTION!" -ForegroundColor Yellow
    Write-Host "$successCount/$totalCount fichiers sont corrects." -ForegroundColor Yellow
    Write-Host "Vérifiez les fichiers marqués en rouge ci-dessus." -ForegroundColor Yellow
}

Write-Host ""

# Rechercher l'ancienne IP dans tous les fichiers de configuration
Write-Host "Recherche de l'ancienne IP dans les fichiers de configuration..." -ForegroundColor Cyan
$filesWithOldIP = Get-ChildItem -Path . -Include "*.env","*.md","*.sh","*.ps1" -Recurse -File | 
    Where-Object { $_.FullName -notmatch "node_modules|\.git|target|build" } |
    Select-String -Pattern $ancienneIP -List |
    Select-Object -ExpandProperty Path -Unique

if ($filesWithOldIP) {
    Write-Host ""
    Write-Host "⚠️  Fichiers contenant encore l'ancienne IP:" -ForegroundColor Yellow
    foreach ($file in $filesWithOldIP) {
        $relativePath = $file.Replace($PWD.Path + "\", "")
        Write-Host "  • $relativePath" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Note: Les fichiers de documentation (VERIFICATION_*, RAPPORT_*) peuvent" -ForegroundColor Gray
    Write-Host "contenir l'ancienne IP à titre d'historique, c'est normal." -ForegroundColor Gray
} else {
    Write-Host "✅ Aucune ancienne IP trouvée dans les fichiers de configuration!" -ForegroundColor Green
}

Write-Host ""
