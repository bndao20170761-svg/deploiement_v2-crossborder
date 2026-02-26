# Script de vérification des corrections localhost → Docker service names
# Ce script vérifie que tous les fichiers ont été correctement mis à jour

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Vérification des corrections localhost" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Fonction pour vérifier un fichier
function Test-FileContent {
    param(
        [string]$FilePath,
        [string[]]$BadPatterns,
        [string]$Description
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "[SKIP] $Description - Fichier non trouvé: $FilePath" -ForegroundColor Yellow
        $script:warnings++
        return
    }
    
    $content = Get-Content $FilePath -Raw
    $found = $false
    
    foreach ($pattern in $BadPatterns) {
        if ($content -match $pattern) {
            Write-Host "[ERREUR] $Description" -ForegroundColor Red
            Write-Host "  Fichier: $FilePath" -ForegroundColor Red
            Write-Host "  Trouvé: $pattern" -ForegroundColor Red
            $script:errors++
            $found = $true
        }
    }
    
    if (-not $found) {
        Write-Host "[OK] $Description" -ForegroundColor Green
    }
}

Write-Host "1. Vérification des Bootstrap Properties (Eureka & Config Server)" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow

Test-FileContent `
    -FilePath "gestion_user/src/main/resources/bootstrap.properties" `
    -BadPatterns @("localhost:8761", "localhost:8880", "localhost:8888") `
    -Description "gestion_user/bootstrap.properties"

Test-FileContent `
    -FilePath "gestion_reference/src/main/resources/bootstrap.properties" `
    -BadPatterns @("localhost:8761", "localhost:8880", "localhost:8888") `
    -Description "gestion_reference/bootstrap.properties"

Test-FileContent `
    -FilePath "gestion_patient/src/main/resources/bootstrap.properties" `
    -BadPatterns @("localhost:8761", "localhost:8880", "localhost:8888") `
    -Description "gestion_patient/bootstrap.properties"

Test-FileContent `
    -FilePath "Forum_PVVIH/src/main/resources/bootstrap.properties" `
    -BadPatterns @("localhost:8761", "localhost:8880", "localhost:8888") `
    -Description "Forum_PVVIH/bootstrap.properties"

Write-Host ""
Write-Host "2. Vérification des Application Properties (Database)" -ForegroundColor Yellow
Write-Host "------------------------------------------------------" -ForegroundColor Yellow

Test-FileContent `
    -FilePath "gestion_user/src/main/resources/application.properties" `
    -BadPatterns @("jdbc:mysql://localhost:3306", "jdbc:mysql://localhost:3307") `
    -Description "gestion_user/application.properties"

Test-FileContent `
    -FilePath "gestion_reference/src/main/resources/application.properties" `
    -BadPatterns @("jdbc:mysql://localhost:3306", "jdbc:mysql://localhost:3308") `
    -Description "gestion_reference/application.properties"

Test-FileContent `
    -FilePath "gestion_patient/src/main/resources/application.properties" `
    -BadPatterns @("jdbc:mysql://localhost:3306", "jdbc:mysql://localhost:3309") `
    -Description "gestion_patient/application.properties"

Test-FileContent `
    -FilePath "Forum_PVVIH/src/main/resources/application.properties" `
    -BadPatterns @("mongodb://localhost:27017") `
    -Description "Forum_PVVIH/application.properties"

Write-Host ""
Write-Host "3. Vérification du Gateway (application.yaml)" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Yellow

Test-FileContent `
    -FilePath "Getway_PVVIH/src/main/resources/application.yaml" `
    -BadPatterns @("uri: http://localhost:9089", "uri: http://localhost:9090", "uri: http://localhost:9091", "uri: http://localhost:9092") `
    -Description "Gateway routes"

Write-Host ""
Write-Host "4. Vérification des Feign Clients" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow

Test-FileContent `
    -FilePath "gestion_reference/src/main/java/sn/uasz/referencement_PVVIH/feign/UserServiceClient.java" `
    -BadPatterns @('url = "http://localhost:9089"') `
    -Description "gestion_reference/UserServiceClient.java"

Test-FileContent `
    -FilePath "gestion_patient/src/main/java/sn/uasz/Patient_PVVIH/feign/UserServiceClient.java" `
    -BadPatterns @('url = "http://localhost:9089"') `
    -Description "gestion_patient/UserServiceClient.java"

Write-Host ""
Write-Host "5. Vérification des Feign Properties" -ForegroundColor Yellow
Write-Host "-------------------------------------" -ForegroundColor Yellow

Test-FileContent `
    -FilePath "gestion_reference/src/main/resources/feign.properties" `
    -BadPatterns @("localhost:9089", "localhost:9090") `
    -Description "gestion_reference/feign.properties"

Test-FileContent `
    -FilePath "gestion_patient/src/main/resources/feign.properties" `
    -BadPatterns @("localhost:9089", "localhost:9090") `
    -Description "gestion_patient/feign.properties"

Write-Host ""
Write-Host "6. Vérification du docker-compose.yml" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow

Test-FileContent `
    -FilePath "docker-compose.yml" `
    -BadPatterns @("REACT_APP_API_URL=http://gateway-pvvih", "REACT_APP_GATEWAY_URL=http://gateway-pvvih") `
    -Description "docker-compose.yml - Variables d'environnement frontends"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Résumé de la vérification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ Toutes les vérifications sont passées!" -ForegroundColor Green
    Write-Host "   Votre configuration est correcte pour Docker." -ForegroundColor Green
} elseif ($errors -eq 0) {
    Write-Host "⚠️  $warnings avertissement(s)" -ForegroundColor Yellow
    Write-Host "   Certains fichiers n'ont pas été trouvés, mais aucune erreur détectée." -ForegroundColor Yellow
} else {
    Write-Host "❌ $errors erreur(s) trouvée(s)" -ForegroundColor Red
    Write-Host "   Veuillez corriger les fichiers mentionnés ci-dessus." -ForegroundColor Red
    Write-Host ""
    Write-Host "Rappel des corrections nécessaires:" -ForegroundColor Yellow
    Write-Host "  - Bootstrap: localhost:8761 → api-register:8761" -ForegroundColor Yellow
    Write-Host "  - Bootstrap: localhost:8888 → api-configuration:8888" -ForegroundColor Yellow
    Write-Host "  - Database: localhost:3306 → mysql-xxx:3306" -ForegroundColor Yellow
    Write-Host "  - MongoDB: localhost:27017 → mongodb:27017" -ForegroundColor Yellow
    Write-Host "  - Feign: localhost:90xx → gestion-xxx:8080" -ForegroundColor Yellow
    Write-Host "  - Gateway: localhost:90xx → gestion-xxx:8080" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pour plus d'informations, consultez:" -ForegroundColor Cyan
Write-Host "  - CONFIGURATION_FINALE.md" -ForegroundColor Cyan
Write-Host "  - LOCALHOST_CORRECTIONS_SUMMARY.md" -ForegroundColor Cyan
Write-Host "  - FRONTEND_BACKEND_COMMUNICATION.md" -ForegroundColor Cyan
Write-Host ""

exit $errors
