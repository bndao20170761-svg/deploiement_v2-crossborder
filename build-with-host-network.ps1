# Build Docker images using host network to bypass DNS issues
Write-Host "Building Docker images with host network..." -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "`nCleaning up old images and containers..." -ForegroundColor Yellow
docker-compose down -v 2>$null

Write-Host "`nBuilding images (this may take 10-15 minutes)..." -ForegroundColor Yellow
Write-Host "Using DOCKER_BUILDKIT=0 to avoid network issues..." -ForegroundColor Cyan

$env:DOCKER_BUILDKIT = "0"
$env:COMPOSE_DOCKER_CLI_BUILD = "0"

# Build each service individually with better error handling
$services = @(
    "api-configuration",
    "api-register", 
    "gateway-pvvih",
    "gestion-reference",
    "gestion-patient",
    "gestion-user",
    "forum-pvvih",
    "a-reference-front",
    "a-user-front",
    "gestion-forum-front"
)

$failed = @()
$succeeded = @()

foreach ($service in $services) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Building: $service" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    
    $result = docker-compose build --no-cache $service 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $service built successfully" -ForegroundColor Green
        $succeeded += $service
    } else {
        Write-Host "✗ $service build failed" -ForegroundColor Red
        $failed += $service
        Write-Host "Error output:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Build Summary" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

if ($succeeded.Count -gt 0) {
    Write-Host "`nSuccessfully built ($($succeeded.Count)):" -ForegroundColor Green
    $succeeded | ForEach-Object { Write-Host "  ✓ $_" -ForegroundColor Green }
}

if ($failed.Count -gt 0) {
    Write-Host "`nFailed to build ($($failed.Count)):" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  ✗ $_" -ForegroundColor Red }
    Write-Host "`nTo fix DNS issues, try:" -ForegroundColor Yellow
    Write-Host "1. .\fix-docker-dns.ps1" -ForegroundColor Cyan
    Write-Host "2. Restart Docker Desktop" -ForegroundColor Cyan
    Write-Host "3. Run this script again" -ForegroundColor Cyan
} else {
    Write-Host "`n✓ All services built successfully!" -ForegroundColor Green
    Write-Host "`nYou can now start the services with:" -ForegroundColor Cyan
    Write-Host "docker-compose up -d" -ForegroundColor Yellow
}
