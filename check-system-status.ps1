# Script de vérification rapide de l'état du système
# Vérifie que tous les services fonctionnent correctement

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vérification État du Système" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Docker est en cours d'exécution
Write-Host "1. Vérification Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "   Docker est actif" -ForegroundColor Green
}
catch {
    Write-Host "   ERREUR: Docker n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Vérifier les conteneurs
Write-Host "2. État des conteneurs..." -ForegroundColor Yellow
$containers = docker-compose ps --format json | ConvertFrom-Json

$expectedServices = @(
    "api-register",
    "api-configuration",
    "gateway-pvvih",
    "forum-pvvih",
    "gestion-user",
    "gestion-patient",
    "gestion-reference",
    "mongodb",
    "mysql-user",
    "mysql-reference",
    "mysql-patient"
)

$runningServices = @()
$stoppedServices = @()

foreach ($service in $expectedServices) {
    $container = $containers | Where-Object { $_.Service -eq $service }
    if ($container) {
        if ($container.State -eq "running") {
            Write-Host "   $service : Running" -ForegroundColor Green
            $runningServices += $service
        }
        else {
            Write-Host "   $service : $($container.State)" -ForegroundColor Red
            $stoppedServices += $service
        }
    }
    else {
        Write-Host "   $service : Not found" -ForegroundColor Red
        $stoppedServices += $service
    }
}

Write-Host ""
Write-Host "   Services actifs: $($runningServices.Count)/$($expectedServices.Count)" -ForegroundColor $(if ($runningServices.Count -eq $expectedServices.Count) { "Green" } else { "Yellow" })

if ($stoppedServices.Count -gt 0) {
    Write-Host "   Services arrêtés/manquants: $($stoppedServices -join ', ')" -ForegroundColor Red
}

Write-Host ""

# Vérifier le Config Server
Write-Host "3. Vérification Config Server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8888/actuator/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   Config Server: $($health.status)" -ForegroundColor Green
    
    # Tester un endpoint de configuration
    $testConfig = Invoke-RestMethod -Uri "http://localhost:8888/Forum_API_PVVIH/dev" -TimeoutSec 5 -ErrorAction Stop
    if ($testConfig.propertySources) {
        Write-Host "   Configurations disponibles: OK" -ForegroundColor Green
    }
}
catch {
    Write-Host "   Config Server: ERREUR" -ForegroundColor Red
    Write-Host "   Détails: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Vérifier Eureka
Write-Host "4. Vérification Eureka (Service Registry)..." -ForegroundColor Yellow
try {
    $eureka = Invoke-RestMethod -Uri "http://localhost:8761/eureka/apps" -Headers @{Accept="application/json"} -TimeoutSec 5 -ErrorAction Stop
    $registeredApps = $eureka.applications.application
    
    if ($registeredApps) {
        Write-Host "   Eureka: Actif" -ForegroundColor Green
        Write-Host "   Services enregistrés:" -ForegroundColor Gray
        
        if ($registeredApps -is [Array]) {
            foreach ($app in $registeredApps) {
                $instanceCount = if ($app.instance -is [Array]) { $app.instance.Count } else { 1 }
                Write-Host "     - $($app.name) ($instanceCount instance(s))" -ForegroundColor Gray
            }
        }
        else {
            $instanceCount = if ($registeredApps.instance -is [Array]) { $registeredApps.instance.Count } else { 1 }
            Write-Host "     - $($registeredApps.name) ($instanceCount instance(s))" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "   Eureka: Actif (aucun service enregistré)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   Eureka: ERREUR" -ForegroundColor Red
    Write-Host "   Détails: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Vérifier le Gateway
Write-Host "5. Vérification API Gateway..." -ForegroundColor Yellow
try {
    $gateway = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   Gateway: $($gateway.status)" -ForegroundColor Green
}
catch {
    Write-Host "   Gateway: ERREUR" -ForegroundColor Red
    Write-Host "   Détails: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Vérifier les bases de données
Write-Host "6. Vérification Bases de données..." -ForegroundColor Yellow

$databases = @(
    @{Name="MongoDB"; Container="mongodb"; Port=27017},
    @{Name="MySQL User"; Container="mysql-user"; Port=3307},
    @{Name="MySQL Reference"; Container="mysql-reference"; Port=3308},
    @{Name="MySQL Patient"; Container="mysql-patient"; Port=3309}
)

foreach ($db in $databases) {
    $container = docker ps --filter "name=$($db.Container)" --format "{{.Status}}"
    if ($container -match "Up") {
        Write-Host "   $($db.Name): Actif" -ForegroundColor Green
    }
    else {
        Write-Host "   $($db.Name): Inactif" -ForegroundColor Red
    }
}

Write-Host ""

# Résumé
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Résumé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($runningServices.Count -eq $expectedServices.Count) {
    Write-Host "Tous les services sont actifs!" -ForegroundColor Green
}
else {
    Write-Host "Certains services ont des problèmes." -ForegroundColor Yellow
    Write-Host "Consultez les logs pour plus de détails:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f" -ForegroundColor White
}

Write-Host ""
Write-Host "Pour voir les logs d'un service spécifique:" -ForegroundColor Gray
Write-Host "  docker logs <nom-service> -f" -ForegroundColor White
Write-Host ""
Write-Host "Pour redémarrer un service:" -ForegroundColor Gray
Write-Host "  docker-compose restart <nom-service>" -ForegroundColor White
Write-Host ""
