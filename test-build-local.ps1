# Script pour tester les builds localement avant de pusher
# Simule ce que fait le pipeline GitHub Actions

param(
    [switch]$Backends = $false,
    [switch]$Frontends = $false,
    [switch]$All = $false,
    [string]$Service = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Build Local (Simulation CI/CD)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Si aucun paramètre, afficher l'aide
if (-not $Backends -and -not $Frontends -and -not $All -and [string]::IsNullOrEmpty($Service)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\test-build-local.ps1 -All              # Tester tous les services" -ForegroundColor White
    Write-Host "  .\test-build-local.ps1 -Backends         # Tester tous les backends" -ForegroundColor White
    Write-Host "  .\test-build-local.ps1 -Frontends        # Tester tous les frontends" -ForegroundColor White
    Write-Host "  .\test-build-local.ps1 -Service nom      # Tester un service spécifique" -ForegroundColor White
    Write-Host ""
    Write-Host "Services disponibles:" -ForegroundColor Yellow
    Write-Host "  Backends:  api-register, api-configuration, gateway-pvvih," -ForegroundColor Gray
    Write-Host "             forum-pvvih, gestion-user, gestion-reference, gestion-patient" -ForegroundColor Gray
    Write-Host "  Frontends: gestion-forum-front, a-reference-front, a-user-front" -ForegroundColor Gray
    exit 0
}

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

$servicesToTest = @()

# Déterminer quels services tester
if ($All) {
    $servicesToTest = $backendServices + $frontendServices
} elseif ($Backends) {
    $servicesToTest = $backendServices
} elseif ($Frontends) {
    $servicesToTest = $frontendServices
} elseif (-not [string]::IsNullOrEmpty($Service)) {
    $found = $false
    foreach ($s in ($backendServices + $frontendServices)) {
        if ($s.Name -eq $Service) {
            $servicesToTest = @($s)
            $found = $true
            break
        }
    }
    if (-not $found) {
        Write-Host "✗ Service '$Service' non trouvé" -ForegroundColor Red
        exit 1
    }
}

$totalServices = $servicesToTest.Count
$successCount = 0
$failCount = 0
$results = @()

Write-Host "Services à tester: $totalServices" -ForegroundColor Cyan
Write-Host ""

# Fonction pour tester un backend
function Test-Backend {
    param($service)
    
    Write-Host "Testing $($service.Name)..." -ForegroundColor Yellow
    
    if (-not (Test-Path "$($service.Path)/pom.xml")) {
        Write-Host "  ✗ pom.xml non trouvé" -ForegroundColor Red
        return $false
    }
    
    try {
        Push-Location $service.Path
        
        # Test Maven
        Write-Host "  Running Maven build..." -ForegroundColor Gray
        mvn clean package -DskipTests -B -q
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Maven build réussi" -ForegroundColor Green
            
            # Vérifier que le JAR existe
            $jarFiles = Get-ChildItem -Path "target" -Filter "*.jar" -ErrorAction SilentlyContinue
            if ($jarFiles) {
                Write-Host "  ✓ JAR créé: $($jarFiles[0].Name)" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  ✗ JAR non trouvé dans target/" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "  ✗ Maven build échoué" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ✗ Erreur: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

# Fonction pour tester un frontend
function Test-Frontend {
    param($service)
    
    Write-Host "Testing $($service.Name)..." -ForegroundColor Yellow
    
    if (-not (Test-Path "$($service.Path)/package.json")) {
        Write-Host "  ✗ package.json non trouvé" -ForegroundColor Red
        return $false
    }
    
    try {
        Push-Location $service.Path
        
        # Vérifier si node_modules existe
        if (-not (Test-Path "node_modules")) {
            Write-Host "  Installing dependencies..." -ForegroundColor Gray
            npm ci --silent
        }
        
        # Test build
        Write-Host "  Running npm build..." -ForegroundColor Gray
        npm run build 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ npm build réussi" -ForegroundColor Green
            
            # Vérifier que le dossier build existe
            if (Test-Path "build") {
                $buildFiles = Get-ChildItem -Path "build" -Recurse -File
                Write-Host "  ✓ Build créé: $($buildFiles.Count) fichiers" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  ✗ Dossier build non trouvé" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "  ✗ npm build échoué" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ✗ Erreur: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

# Tester chaque service
foreach ($service in $servicesToTest) {
    Write-Host ""
    Write-Host "[$($successCount + $failCount + 1)/$totalServices] " -NoNewline -ForegroundColor Cyan
    
    $isBackend = $backendServices | Where-Object { $_.Name -eq $service.Name }
    
    if ($isBackend) {
        $success = Test-Backend $service
    } else {
        $success = Test-Frontend $service
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
Write-Host "  Résumé des Tests" -ForegroundColor Cyan
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
    Write-Host "  ✓ Tous les tests ont réussi!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez pusher en toute confiance:" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'Votre message'" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ Certains tests ont échoué" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez corriger les erreurs avant de pusher." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
