# Script pour builder et pusher toutes les images vers Docker Hub
# Alternative à GitHub Actions - Fonctionne localement

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername,
    
    [switch]$SkipTests = $false,
    [switch]$BackendsOnly = $false,
    [switch]$FrontendsOnly = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build & Push vers Docker Hub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Docker
Write-Host "Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "Veuillez démarrer Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Login Docker Hub
Write-Host ""
Write-Host "Connexion à Docker Hub..." -ForegroundColor Yellow
Write-Host "Entrez votre mot de passe Docker Hub (ou token):" -ForegroundColor Gray
docker login -u $DockerHubUsername

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Échec de la connexion à Docker Hub" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Connecté à Docker Hub" -ForegroundColor Green

# Définir les services
$backendServices = @(
    @{Name="api-register"; Path="api_register"},
    @{Name="api-configuration"; Path="api_configuration/demo"},
    @{Name="gateway-pvvih"; Path="Getway_PVVIH"},
    @{Name="forum-pvvih"; Path="Forum_PVVIH"},
    @{Name="gestion-user"; Path="gestion_user"},
    @{Name="gestion-reference"; Path="gestion_reference"},
    @{Name="gestion-patient"; Path="gestion_patient"}
)

$frontendServices = @(
    @{Name="gestion-forum-front"; Path="gestion_forum_front"},
    @{Name="a-reference-front"; Path="a_reference_front"},
    @{Name="a-user-front"; Path="a_user_front"}
)

$servicesToBuild = @()

if ($BackendsOnly) {
    $servicesToBuild = $backendServices
} elseif ($FrontendsOnly) {
    $servicesToBuild = $frontendServices
} else {
    $servicesToBuild = $backendServices + $frontendServices
}

$totalServices = $servicesToBuild.Count
$successCount = 0
$failCount = 0
$results = @()

Write-Host ""
Write-Host "Services à builder: $totalServices" -ForegroundColor Cyan
Write-Host ""

# Fonction pour builder un backend
function Build-Backend {
    param($service)
    
    Write-Host "[$($successCount + $failCount + 1)/$totalServices] Building $($service.Name)..." -ForegroundColor Yellow
    
    try {
        Push-Location $service.Path
        
        # Build Maven
        Write-Host "  Maven build..." -ForegroundColor Gray
        if ($SkipTests) {
            mvn clean package -DskipTests -B
        } else {
            mvn clean package -B
        }
        
        if ($LASTEXITCODE -ne 0) {
            throw "Maven build failed"
        }
        
        Write-Host "  ✓ Maven build réussi" -ForegroundColor Green
        
        Pop-Location
        
        # Build Docker image
        Write-Host "  Docker build..." -ForegroundColor Gray
        $imageName = "${DockerHubUsername}/$($service.Name):latest"
        docker build -t $imageName $service.Path
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed"
        }
        
        Write-Host "  ✓ Docker build réussi" -ForegroundColor Green
        
        # Push to Docker Hub
        Write-Host "  Pushing to Docker Hub..." -ForegroundColor Gray
        docker push $imageName
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker push failed"
        }
        
        Write-Host "  ✓ Pushed: $imageName" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "  ✗ Erreur: $_" -ForegroundColor Red
        Pop-Location -ErrorAction SilentlyContinue
        return $false
    }
}

# Fonction pour builder un frontend
function Build-Frontend {
    param($service)
    
    Write-Host "[$($successCount + $failCount + 1)/$totalServices] Building $($service.Name)..." -ForegroundColor Yellow
    
    try {
        # Build Docker image
        Write-Host "  Docker build (includes npm build)..." -ForegroundColor Gray
        $imageName = "${DockerHubUsername}/$($service.Name):latest"
        docker build -t $imageName $service.Path
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed"
        }
        
        Write-Host "  ✓ Docker build réussi" -ForegroundColor Green
        
        # Push to Docker Hub
        Write-Host "  Pushing to Docker Hub..." -ForegroundColor Gray
        docker push $imageName
        
        if ($LASTEXITCODE -ne 0) {
            throw "Docker push failed"
        }
        
        Write-Host "  ✓ Pushed: $imageName" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "  ✗ Erreur: $_" -ForegroundColor Red
        return $false
    }
}

# Builder chaque service
foreach ($service in $servicesToBuild) {
    Write-Host ""
    
    $isBackend = $backendServices | Where-Object { $_.Name -eq $service.Name }
    
    if ($isBackend) {
        $success = Build-Backend $service
    } else {
        $success = Build-Frontend $service
    }
    
    if ($success) {
        $successCount++
        $results += @{Service=$service.Name; Status="✓ Success"; Color="Green"}
    } else {
        $failCount++
        $results += @{Service=$service.Name; Status="✗ Failed"; Color="Red"}
    }
}

# Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Résumé du Build & Push" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($result in $results) {
    Write-Host "  $($result.Service): " -NoNewline
    Write-Host $result.Status -ForegroundColor $result.Color
}

Write-Host ""
Write-Host "Total: $totalServices services" -ForegroundColor Cyan
Write-Host "Réussis: $successCount" -ForegroundColor Green
Write-Host "Échoués: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Toutes les images sont sur Docker Hub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant déployer:" -ForegroundColor Yellow
    Write-Host "  .\deploy-from-dockerhub.ps1 -DockerHubUsername $DockerHubUsername" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ Certains builds ont échoué" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    exit 1
}
