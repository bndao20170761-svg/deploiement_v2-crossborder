# Script de vérification de la configuration Docker
# Usage: .\verify-setup.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Vérification de la configuration Docker" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Vérifier Docker
Write-Host "1. Vérification de Docker..." -NoNewline
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVersion = docker --version
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   $dockerVersion" -ForegroundColor Gray
} else {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    Write-Host "   Docker n'est pas installé" -ForegroundColor Red
    $allGood = $false
}

# Vérifier Docker Compose
Write-Host "2. Vérification de Docker Compose..." -NoNewline
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    $composeVersion = docker-compose --version
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   $composeVersion" -ForegroundColor Gray
} else {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    Write-Host "   Docker Compose n'est pas installé" -ForegroundColor Red
    $allGood = $false
}

# Vérifier les Dockerfiles
Write-Host "3. Vérification des Dockerfiles..." -NoNewline
$dockerfiles = @(
    "Forum_PVVIH/Dockerfile",
    "gestion_user/Dockerfile",
    "gestion_reference/Dockerfile",
    "gestion_patient/Dockerfile",
    "Getway_PVVIH/Dockerfile",
    "api_configuration/demo/Dockerfile",
    "api_register/Dockerfile",
    "gestion_forum_front/Dockerfile",
    "a_reference_front/Dockerfile",
    "a_user_front/Dockerfile"
)

$missingDockerfiles = @()
foreach ($dockerfile in $dockerfiles) {
    if (-not (Test-Path $dockerfile)) {
        $missingDockerfiles += $dockerfile
    }
}

if ($missingDockerfiles.Count -eq 0) {
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   Tous les Dockerfiles sont présents (10/10)" -ForegroundColor Gray
} else {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    Write-Host "   Dockerfiles manquants:" -ForegroundColor Red
    foreach ($missing in $missingDockerfiles) {
        Write-Host "   - $missing" -ForegroundColor Red
    }
    $allGood = $false
}

# Vérifier docker-compose.yml
Write-Host "4. Vérification de docker-compose.yml..." -NoNewline
if (Test-Path "docker-compose.yml") {
    Write-Host " ✅ OK" -ForegroundColor Green
} else {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    $allGood = $false
}

# Vérifier docker-compose.dev.yml
Write-Host "5. Vérification de docker-compose.dev.yml..." -NoNewline
if (Test-Path "docker-compose.dev.yml") {
    Write-Host " ✅ OK" -ForegroundColor Green
} else {
    Write-Host " ⚠️  MANQUANT" -ForegroundColor Yellow
}

# Vérifier docker-compose.prod.yml
Write-Host "6. Vérification de docker-compose.prod.yml..." -NoNewline
if (Test-Path "docker-compose.prod.yml") {
    Write-Host " ✅ OK" -ForegroundColor Green
} else {
    Write-Host " ⚠️  MANQUANT" -ForegroundColor Yellow
}

# Vérifier .env
Write-Host "7. Vérification du fichier .env..." -NoNewline
if (Test-Path ".env") {
    Write-Host " ✅ OK" -ForegroundColor Green
} else {
    Write-Host " ⚠️  MANQUANT" -ForegroundColor Yellow
    Write-Host "   Créez-le depuis .env.example: copy .env.example .env" -ForegroundColor Yellow
}

# Vérifier .env.example
Write-Host "8. Vérification de .env.example..." -NoNewline
if (Test-Path ".env.example") {
    Write-Host " ✅ OK" -ForegroundColor Green
} else {
    Write-Host " ❌ ERREUR" -ForegroundColor Red
    $allGood = $false
}

# Vérifier les scripts
Write-Host "9. Vérification des scripts..." -NoNewline
$scripts = @("start.ps1", "stop.ps1", "logs.ps1", "health-check.ps1")
$missingScripts = @()
foreach ($script in $scripts) {
    if (-not (Test-Path $script)) {
        $missingScripts += $script
    }
}

if ($missingScripts.Count -eq 0) {
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   Tous les scripts sont présents (4/4)" -ForegroundColor Gray
} else {
    Write-Host " ⚠️  INCOMPLET" -ForegroundColor Yellow
    Write-Host "   Scripts manquants:" -ForegroundColor Yellow
    foreach ($missing in $missingScripts) {
        Write-Host "   - $missing" -ForegroundColor Yellow
    }
}

# Vérifier les ports disponibles
Write-Host "10. Vérification des ports..." -NoNewline
$ports = @(3001, 3002, 3003, 8080, 8761, 8888)
$usedPorts = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $usedPorts += $port
    }
}

if ($usedPorts.Count -eq 0) {
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "   Tous les ports sont disponibles" -ForegroundColor Gray
} else {
    Write-Host " ⚠️  ATTENTION" -ForegroundColor Yellow
    Write-Host "   Ports déjà utilisés:" -ForegroundColor Yellow
    foreach ($port in $usedPorts) {
        Write-Host "   - Port $port" -ForegroundColor Yellow
    }
}

# Vérifier la documentation
Write-Host "11. Vérification de la documentation..." -NoNewline
$docs = @("README.md", "DEPLOYMENT.md", "QUICK_START.md")
$missingDocs = @()
foreach ($doc in $docs) {
    if (-not (Test-Path $doc)) {
        $missingDocs += $doc
    }
}

if ($missingDocs.Count -eq 0) {
    Write-Host " ✅ OK" -ForegroundColor Green
} else {
    Write-Host " ⚠️  INCOMPLET" -ForegroundColor Yellow
}

# Résumé
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ Configuration complète et prête!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Créer le fichier .env: copy .env.example .env" -ForegroundColor White
    Write-Host "2. Éditer .env avec vos valeurs" -ForegroundColor White
    Write-Host "3. Démarrer le système: .\start.ps1 dev" -ForegroundColor White
} else {
    Write-Host "❌ Configuration incomplète" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez corriger les erreurs ci-dessus" -ForegroundColor Red
}
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
