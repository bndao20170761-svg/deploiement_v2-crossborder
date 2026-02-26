# Script de vérification de santé des services (Windows)
# Usage: .\health-check.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Vérification de santé des services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="API Gateway"; Url="http://localhost:8080/actuator/health"},
    @{Name="Eureka Registry"; Url="http://localhost:8761/actuator/health"},
    @{Name="Config Server"; Url="http://localhost:8888/actuator/health"},
    @{Name="Forum Frontend"; Url="http://localhost:3001/health"},
    @{Name="Reference Frontend"; Url="http://localhost:3002/health"},
    @{Name="User Frontend"; Url="http://localhost:3003/health"}
)

foreach ($service in $services) {
    Write-Host "Vérification de $($service.Name)..." -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ OK" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ❌ ERREUR" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 État des conteneurs Docker:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
