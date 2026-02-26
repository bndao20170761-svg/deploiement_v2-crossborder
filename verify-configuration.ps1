# Script de vérification de la configuration
# Usage: .\verify-configuration.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Vérification de la configuration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true
$warnings = @()

# Vérifier docker-compose.yml
Write-Host "1. Vérification de docker-compose.yml..." -NoNewline
if (Test-Path "docker-compose.yml") {
    $content = Get-Content "docker-compose.yml" -Raw
    
    # Vérifier que les frontends utilisent localhost
    if ($content -match 'REACT_APP_.*=http://localhost') {
        Write-Host " ✅ OK" -ForegroundColor Green
        Write-Host "   Frontends utilisent localhost (correct)" -ForegroundColor Gray
    } else {
        Write-Host " ⚠️  ATTENTION" -ForegroundColor Yellow
        Write-Host "   Les frontends devraient utiliser localhost" -ForegroundColor Yellow
        $warnings += "Frontends: Vérifier les variables REACT_APP_* dans docker-compose.yml"
    }
    
    # Vérifier que les services backend utilisent les noms Docker
    if ($content -match 'uri: http://gestion-user:8080' -and 
        $content -match 'uri: http://forum-pvvih:8080') {
        Write-Host "   Gateway utilise les noms de services Docker (correct)" -ForegroundColor Gray
    } else {
        Write-Host " ⚠️  ATTENTION" -ForegroundColor Yellow
        Write-Host "   Gateway devrait utiliser les noms de services Docker" -ForegroundColor Yellow
        $warnings += "Gateway: Vérifier les routes dans application.yaml"
    }
} else {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    $allGood = $false
}

# Vérifier les fichiers de configuration frontend
Write-Host "2. Vérification des fichiers de configuration frontend..." -NoNewline
$frontendConfigs = @(
    "gestion_forum_front/src/config/api.js",
    "a_reference_front/src/config/api.js",
    "a_user_front/src/config/api.js"
)

$missingConfigs = @()
foreach ($config in $frontendConfigs) {
    if (-not (Test-Path $config)) {
        $missingConfigs += $config
    }
}

if ($missingConfigs.Count -eq 0) {
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   Tous les fichiers de configuration frontend sont présents" -ForegroundColor Gray
} else {
    Write-Host " ⚠️  MANQUANT" -ForegroundColor Yellow
    foreach ($missing in $missingConfigs) {
        Write-Host "   - $missing" -ForegroundColor Yellow
    }
    $warnings += "Créer les fichiers de configuration frontend manquants"
}

# Vérifier les fichiers feign.properties
Write-Host "3. Vérification des fichiers feign.properties..." -NoNewline
$feignConfigs = @(
    "gestion_patient/src/main/resources/feign.properties",
    "gestion_reference/src/main/resources/feign.properties"
)

$missingFeign = @()
foreach ($config in $feignConfigs) {
    if (-not (Test-Path $config)) {
        $missingFeign += $config
    }
}

if ($missingFeign.Count -eq 0) {
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   Tous les fichiers feign.properties sont présents" -ForegroundColor Gray
} else {
    Write-Host " ⚠️  MANQUANT" -ForegroundColor Yellow
    foreach ($missing in $missingFeign) {
        Write-Host "   - $missing" -ForegroundColor Yellow
    }
    $warnings += "Créer les fichiers feign.properties manquants"
}

# Vérifier Gateway application.yaml
Write-Host "4. Vérification de Gateway application.yaml..." -NoNewline
if (Test-Path "Getway_PVVIH/src/main/resources/application.yaml") {
    $content = Get-Content "Getway_PVVIH/src/main/resources/application.yaml" -Raw
    
    if ($content -match 'uri: http://gestion-user:8080' -and 
        $content -match 'uri: http://forum-pvvih:8080' -and
        $content -match 'uri: http://gestion-reference:8080') {
        Write-Host " ✅ OK" -ForegroundColor Green
        Write-Host "   Gateway utilise les noms de services Docker" -ForegroundColor Gray
    } else {
        Write-Host " ⚠️  ATTENTION" -ForegroundColor Yellow
        Write-Host "   Gateway devrait utiliser les noms de services Docker" -ForegroundColor Yellow
        $warnings += "Gateway: Corriger les URIs dans application.yaml"
    }
} else {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    $allGood = $false
}

# Vérifier les bootstrap.properties
Write-Host "5. Vérification des bootstrap.properties..." -NoNewline
$bootstrapFiles = @(
    "gestion_user/src/main/resources/bootstrap.properties",
    "gestion_reference/src/main/resources/bootstrap.properties"
)

$incorrectBootstrap = @()
foreach ($file in $bootstrapFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match 'localhost:8880' -or $content -match 'localhost:8761') {
            $incorrectBootstrap += $file
        }
    }
}

if ($incorrectBootstrap.Count -eq 0) {
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   Tous les bootstrap.properties utilisent les noms de services" -ForegroundColor Gray
} else {
    Write-Host " ⚠️  ATTENTION" -ForegroundColor Yellow
    foreach ($file in $incorrectBootstrap) {
        Write-Host "   - $file contient localhost" -ForegroundColor Yellow
    }
    $warnings += "Bootstrap: Remplacer localhost par les noms de services Docker"
}

# Vérifier les application.properties
Write-Host "6. Vérification des application.properties..." -NoNewline
$appPropsFiles = @(
    "gestion_user/src/main/resources/application.properties",
    "gestion_reference/src/main/resources/application.properties"
)

$incorrectAppProps = @()
foreach ($file in $appPropsFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match 'localhost:3306') {
            $incorrectAppProps += $file
        }
    }
}

if ($incorrectAppProps.Count -eq 0) {
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   Tous les application.properties utilisent les noms de services" -ForegroundColor Gray
} else {
    Write-Host " ⚠️  ATTENTION" -ForegroundColor Yellow
    foreach ($file in $incorrectAppProps) {
        Write-Host "   - $file contient localhost" -ForegroundColor Yellow
    }
    $warnings += "Application.properties: Remplacer localhost par les noms de services Docker"
}

# Vérifier la documentation
Write-Host "7. Vérification de la documentation..." -NoNewline
$docs = @(
    "README.md",
    "DEPLOYMENT.md",
    "QUICK_START.md",
    "MICROSERVICES_CONFIGURATION.md",
    "LOCALHOST_CORRECTIONS_SUMMARY.md",
    "FRONTEND_BACKEND_COMMUNICATION.md",
    "FINAL_CONFIGURATION_CHECKLIST.md",
    "CONFIGURATION_FINALE.md"
)

$missingDocs = @()
foreach ($doc in $docs) {
    if (-not (Test-Path $doc)) {
        $missingDocs += $doc
    }
}

if ($missingDocs.Count -eq 0) {
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   Toute la documentation est présente (8/8)" -ForegroundColor Gray
} else {
    Write-Host " ⚠️  INCOMPLET" -ForegroundColor Yellow
    Write-Host "   Documentation manquante: $($missingDocs.Count)/$($docs.Count)" -ForegroundColor Yellow
}

# Résumé
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

if ($allGood -and $warnings.Count -eq 0) {
    Write-Host "✅ Configuration parfaite!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Votre système est correctement configuré:" -ForegroundColor Green
    Write-Host "  - Frontends utilisent localhost (correct)" -ForegroundColor White
    Write-Host "  - Backends utilisent les noms de services Docker (correct)" -ForegroundColor White
    Write-Host "  - Tous les fichiers de configuration sont présents" -ForegroundColor White
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Créer le fichier .env: copy .env.example .env" -ForegroundColor White
    Write-Host "2. Démarrer le système: .\start.ps1 dev" -ForegroundColor White
    Write-Host "3. Vérifier la santé: .\health-check.ps1" -ForegroundColor White
} elseif ($warnings.Count -gt 0) {
    Write-Host "⚠️  Configuration avec avertissements" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Points à vérifier:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Consultez la documentation pour plus de détails:" -ForegroundColor Cyan
    Write-Host "  - CONFIGURATION_FINALE.md" -ForegroundColor White
    Write-Host "  - FRONTEND_BACKEND_COMMUNICATION.md" -ForegroundColor White
} else {
    Write-Host "❌ Configuration incomplète" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez corriger les erreurs ci-dessus" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
