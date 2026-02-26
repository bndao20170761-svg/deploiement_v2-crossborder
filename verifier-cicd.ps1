# Script de vérification de la configuration CI/CD

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vérification Configuration CI/CD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Vérifier Git
Write-Host "1. Vérification Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "   ✓ Git installé: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Git n'est pas installé" -ForegroundColor Red
    $allGood = $false
}

# 2. Vérifier le repository Git
Write-Host ""
Write-Host "2. Vérification du repository Git..." -ForegroundColor Yellow
try {
    $gitRemote = git remote get-url origin 2>$null
    if ($gitRemote) {
        Write-Host "   ✓ Repository Git configuré: $gitRemote" -ForegroundColor Green
        
        # Vérifier si c'est un repo GitHub
        if ($gitRemote -match "github.com") {
            Write-Host "   ✓ Repository GitHub détecté" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ Le repository n'est pas sur GitHub" -ForegroundColor Yellow
            Write-Host "     Le pipeline CI/CD nécessite GitHub" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ✗ Pas de repository Git configuré" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   ✗ Erreur lors de la vérification du repository" -ForegroundColor Red
    $allGood = $false
}

# 3. Vérifier le fichier workflow
Write-Host ""
Write-Host "3. Vérification du fichier workflow..." -ForegroundColor Yellow
$workflowPath = ".github/workflows/deploiement.yml"
if (Test-Path $workflowPath) {
    Write-Host "   ✓ Fichier workflow trouvé: $workflowPath" -ForegroundColor Green
    
    # Vérifier que le fichier n'est pas vide
    $content = Get-Content $workflowPath -Raw
    if ($content.Length -gt 100) {
        Write-Host "   ✓ Fichier workflow configuré" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Fichier workflow vide ou incomplet" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ✗ Fichier workflow non trouvé" -ForegroundColor Red
    $allGood = $false
}

# 4. Vérifier Docker
Write-Host ""
Write-Host "4. Vérification Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    $dockerVersion = docker --version
    Write-Host "   ✓ Docker en cours d'exécution: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "     (Nécessaire uniquement pour le déploiement local)" -ForegroundColor Gray
}

# 5. Vérifier les Dockerfiles
Write-Host ""
Write-Host "5. Vérification des Dockerfiles..." -ForegroundColor Yellow

$services = @(
    @{Name="api-register"; Path="api_register/Dockerfile"},
    @{Name="api-configuration"; Path="api_configuration/demo/Dockerfile"},
    @{Name="gateway-pvvih"; Path="Getway_PVVIH/Dockerfile"},
    @{Name="forum-pvvih"; Path="Forum_PVVIH/Dockerfile"},
    @{Name="gestion-user"; Path="gestion_user/Dockerfile"},
    @{Name="gestion-reference"; Path="gestion_reference/Dockerfile"},
    @{Name="gestion-patient"; Path="gestion_patient/Dockerfile"},
    @{Name="gestion-forum-front"; Path="gestion_forum_front/Dockerfile"},
    @{Name="a-reference-front"; Path="a_reference_front/Dockerfile"},
    @{Name="a-user-front"; Path="a_user_front/Dockerfile"}
)

$missingDockerfiles = 0
foreach ($service in $services) {
    if (Test-Path $service.Path) {
        Write-Host "   ✓ $($service.Name)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $($service.Name) - Dockerfile manquant: $($service.Path)" -ForegroundColor Red
        $missingDockerfiles++
        $allGood = $false
    }
}

if ($missingDockerfiles -eq 0) {
    Write-Host "   ✓ Tous les Dockerfiles sont présents" -ForegroundColor Green
}

# 6. Vérifier les pom.xml (backends)
Write-Host ""
Write-Host "6. Vérification des pom.xml (backends)..." -ForegroundColor Yellow

$backendServices = @(
    "api_register",
    "api_configuration/demo",
    "Getway_PVVIH",
    "Forum_PVVIH",
    "gestion_user",
    "gestion_reference",
    "gestion_patient"
)

$missingPoms = 0
foreach ($service in $backendServices) {
    $pomPath = "$service/pom.xml"
    if (Test-Path $pomPath) {
        Write-Host "   ✓ $service" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $service - pom.xml manquant" -ForegroundColor Red
        $missingPoms++
        $allGood = $false
    }
}

if ($missingPoms -eq 0) {
    Write-Host "   ✓ Tous les pom.xml sont présents" -ForegroundColor Green
}

# 7. Vérifier les package.json (frontends)
Write-Host ""
Write-Host "7. Vérification des package.json (frontends)..." -ForegroundColor Yellow

$frontendServices = @(
    "gestion_forum_front",
    "a_reference_front",
    "a_user_front"
)

$missingPackages = 0
foreach ($service in $frontendServices) {
    $packagePath = "$service/package.json"
    if (Test-Path $packagePath) {
        Write-Host "   ✓ $service" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $service - package.json manquant" -ForegroundColor Red
        $missingPackages++
        $allGood = $false
    }
}

if ($missingPackages -eq 0) {
    Write-Host "   ✓ Tous les package.json sont présents" -ForegroundColor Green
}

# 8. Vérifier docker-compose.dockerhub.yml
Write-Host ""
Write-Host "8. Vérification du fichier docker-compose pour Docker Hub..." -ForegroundColor Yellow
if (Test-Path "docker-compose.dockerhub.yml") {
    Write-Host "   ✓ docker-compose.dockerhub.yml trouvé" -ForegroundColor Green
} else {
    Write-Host "   ✗ docker-compose.dockerhub.yml manquant" -ForegroundColor Red
    $allGood = $false
}

# 9. Vérifier les scripts de déploiement
Write-Host ""
Write-Host "9. Vérification des scripts de déploiement..." -ForegroundColor Yellow
if (Test-Path "deploy-from-dockerhub.ps1") {
    Write-Host "   ✓ deploy-from-dockerhub.ps1 trouvé" -ForegroundColor Green
} else {
    Write-Host "   ✗ deploy-from-dockerhub.ps1 manquant" -ForegroundColor Red
    $allGood = $false
}

# Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  ✓ Configuration CI/CD Prête!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "1. Créez un compte Docker Hub (si nécessaire): https://hub.docker.com" -ForegroundColor White
    Write-Host "2. Créez un token Docker Hub (Account Settings → Security → New Access Token)" -ForegroundColor White
    Write-Host "3. Configurez les secrets GitHub:" -ForegroundColor White
    Write-Host "   - DOCKERHUB_USERNAME" -ForegroundColor Gray
    Write-Host "   - DOCKERHUB_TOKEN" -ForegroundColor Gray
    Write-Host "4. Pushez votre code: git push origin main" -ForegroundColor White
    Write-Host "5. Vérifiez le pipeline dans l'onglet Actions de GitHub" -ForegroundColor White
    Write-Host ""
    Write-Host "Documentation:" -ForegroundColor Yellow
    Write-Host "- DEMARRAGE_RAPIDE_CICD.md - Guide de démarrage rapide" -ForegroundColor White
    Write-Host "- GUIDE_CICD.md - Guide complet" -ForegroundColor White
    Write-Host "- CONFIGURATION_GITHUB_SECRETS.md - Configuration des secrets" -ForegroundColor White
} else {
    Write-Host "  ✗ Configuration Incomplète" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Veuillez corriger les erreurs ci-dessus avant de continuer." -ForegroundColor Yellow
}
Write-Host ""
