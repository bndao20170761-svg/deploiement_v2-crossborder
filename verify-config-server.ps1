# Script to verify Config Server setup and GitHub repository
# This helps diagnose configuration loading issues

Write-Host "=== Config Server Verification Script ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$configServerUrl = "http://localhost:8888"
$gitRepoUrl = "https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git"
$services = @(
    "Forum_API_PVVIH",
    "Patient_API_PVVIH",
    "Reference_API_PVVIH",
    "User_API_PVVIH",
    "GETWAY_PVVIH"
)
$profile = "dev"

Write-Host "Step 1: Checking if Config Server is running..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$configServerUrl/actuator/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  Config Server is UP" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: Config Server is not accessible" -ForegroundColor Red
    Write-Host "  Make sure Docker services are running: docker-compose up -d" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Testing configuration endpoints for each service..." -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($service in $services) {
    $endpoint = "$configServerUrl/$service/$profile"
    Write-Host ""
    Write-Host "Testing: $service" -ForegroundColor Yellow
    Write-Host "  Endpoint: $endpoint" -ForegroundColor Gray
    
    try {
        $config = Invoke-RestMethod -Uri $endpoint -TimeoutSec 10 -ErrorAction Stop
        
        if ($config.propertySources -and $config.propertySources.Count -gt 0) {
            Write-Host "  SUCCESS: Configuration loaded" -ForegroundColor Green
            Write-Host "  Property sources found: $($config.propertySources.Count)" -ForegroundColor Green
            
            # Show first property source
            $firstSource = $config.propertySources[0]
            Write-Host "  Source: $($firstSource.name)" -ForegroundColor Gray
            
            # Check for critical properties
            if ($service -ne "GETWAY_PVVIH") {
                $hasJwtSecret = $firstSource.source.PSObject.Properties.Name -contains "app.jwt.secret"
                if ($hasJwtSecret) {
                    Write-Host "  JWT Secret: Found" -ForegroundColor Green
                } else {
                    Write-Host "  JWT Secret: MISSING" -ForegroundColor Red
                }
            }
            
            $successCount++
        }
        else {
            Write-Host "  WARNING: No property sources found" -ForegroundColor Yellow
            $failCount++
        }
    }
    catch {
        Write-Host "  ERROR: Failed to load configuration" -ForegroundColor Red
        Write-Host "  Details: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "Step 3: Checking Config Server logs..." -ForegroundColor Cyan
Write-Host "  Running: docker logs api-configuration --tail 50" -ForegroundColor Gray
Write-Host ""

try {
    $logs = docker logs api-configuration --tail 50 2>&1
    
    # Check for important log messages
    $hasCloning = $logs | Select-String -Pattern "Cloning" -Quiet
    $hasCloned = $logs | Select-String -Pattern "cloned" -Quiet
    $hasError = $logs | Select-String -Pattern "error|exception" -CaseSensitive:$false -Quiet
    
    if ($hasCloning -or $hasCloned) {
        Write-Host "  Git Clone: Detected" -ForegroundColor Green
    }
    
    if ($hasError) {
        Write-Host "  Errors detected in logs:" -ForegroundColor Red
        $logs | Select-String -Pattern "error|exception" -CaseSensitive:$false | ForEach-Object {
            Write-Host "    $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "  Recent logs:" -ForegroundColor Gray
    Write-Host "  ----------------------------------------" -ForegroundColor DarkGray
    $logs | Select-Object -Last 10 | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
    Write-Host "  ----------------------------------------" -ForegroundColor DarkGray
}
catch {
    Write-Host "  ERROR: Could not retrieve logs" -ForegroundColor Red
    Write-Host "  Details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 4: Checking GitHub repository accessibility..." -ForegroundColor Cyan
Write-Host "  Repository: $gitRepoUrl" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $gitRepoUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  GitHub repository is accessible" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: Could not verify GitHub repository" -ForegroundColor Yellow
    Write-Host "  This might be normal if the repository is private" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Services with valid configuration: $successCount / $($services.Count)" -ForegroundColor $(if ($successCount -eq $services.Count) { "Green" } else { "Yellow" })
Write-Host "Services with configuration issues: $failCount / $($services.Count)" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($successCount -eq $services.Count) {
    Write-Host "All services have valid configurations!" -ForegroundColor Green
    Write-Host "You can now start the microservices." -ForegroundColor Green
}
elseif ($successCount -gt 0) {
    Write-Host "Some services have configuration issues." -ForegroundColor Yellow
    Write-Host "Check the GitHub repository for missing or incorrectly named files." -ForegroundColor Yellow
}
else {
    Write-Host "No services could load configurations!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "1. Configuration files are missing from GitHub repository" -ForegroundColor White
    Write-Host "2. Configuration files have incorrect names" -ForegroundColor White
    Write-Host "3. Config Server cannot access GitHub repository" -ForegroundColor White
    Write-Host "4. Config Server is not fully started yet" -ForegroundColor White
    Write-Host ""
    Write-Host "Recommended actions:" -ForegroundColor Yellow
    Write-Host "1. Verify files exist in GitHub: $gitRepoUrl" -ForegroundColor White
    Write-Host "2. Check Config Server logs: docker logs api-configuration" -ForegroundColor White
    Write-Host "3. Review FIX_CONFIG_SERVER_SOLUTION.md for detailed troubleshooting" -ForegroundColor White
}

Write-Host ""
Write-Host "For detailed troubleshooting, see: FIX_CONFIG_SERVER_SOLUTION.md" -ForegroundColor Cyan
