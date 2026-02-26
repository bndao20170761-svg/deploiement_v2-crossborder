# Quick script to test Config Server endpoints
# This helps verify that configuration files are being served correctly

param(
    [string]$ConfigServerUrl = "http://localhost:8888",
    [string]$Profile = "dev"
)

Write-Host "=== Testing Config Server Endpoints ===" -ForegroundColor Cyan
Write-Host "Config Server: $ConfigServerUrl" -ForegroundColor Gray
Write-Host "Profile: $Profile" -ForegroundColor Gray
Write-Host ""

$services = @(
    @{Name="Forum_API_PVVIH"; RequiredProps=@("gestion.user.url", "app.jwt.secret")},
    @{Name="Patient_API_PVVIH"; RequiredProps=@("app.jwt.secret", "spring.datasource.url")},
    @{Name="Reference_API_PVVIH"; RequiredProps=@("app.jwt.secret", "spring.datasource.url")},
    @{Name="User_API_PVVIH"; RequiredProps=@("app.jwt.secret", "spring.datasource.url")},
    @{Name="GETWAY_PVVIH"; RequiredProps=@("eureka.client.service-url.defaultZone")}
)

foreach ($service in $services) {
    $serviceName = $service.Name
    $endpoint = "$ConfigServerUrl/$serviceName/$Profile"
    
    Write-Host "Testing: $serviceName" -ForegroundColor Yellow
    Write-Host "  URL: $endpoint" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Get -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.propertySources -and $response.propertySources.Count -gt 0) {
            Write-Host "  Status: SUCCESS" -ForegroundColor Green
            Write-Host "  Property sources: $($response.propertySources.Count)" -ForegroundColor Green
            
            # Get all properties from all sources
            $allProps = @{}
            foreach ($source in $response.propertySources) {
                if ($source.source) {
                    foreach ($prop in $source.source.PSObject.Properties) {
                        $allProps[$prop.Name] = $prop.Value
                    }
                }
            }
            
            Write-Host "  Total properties: $($allProps.Count)" -ForegroundColor Green
            
            # Check required properties
            $missingProps = @()
            foreach ($requiredProp in $service.RequiredProps) {
                if ($allProps.ContainsKey($requiredProp)) {
                    Write-Host "    $requiredProp : Found" -ForegroundColor Green
                } else {
                    Write-Host "    $requiredProp : MISSING" -ForegroundColor Red
                    $missingProps += $requiredProp
                }
            }
            
            if ($missingProps.Count -gt 0) {
                Write-Host "  WARNING: Missing required properties!" -ForegroundColor Red
            }
            
            # Show property sources
            Write-Host "  Sources:" -ForegroundColor Gray
            foreach ($source in $response.propertySources) {
                Write-Host "    - $($source.name)" -ForegroundColor DarkGray
            }
        }
        else {
            Write-Host "  Status: FAILED" -ForegroundColor Red
            Write-Host "  Reason: No property sources found" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  Status: ERROR" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "  HTTP Status: $statusCode" -ForegroundColor Red
            
            if ($statusCode -eq 404) {
                Write-Host "  Reason: Configuration file not found" -ForegroundColor Red
                Write-Host "  Expected file: $serviceName-$Profile.properties or $serviceName-$Profile.yml" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "  Reason: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see errors above:" -ForegroundColor Yellow
Write-Host "1. Check that Config Server is running: docker ps | findstr api-configuration" -ForegroundColor White
Write-Host "2. Check Config Server logs: docker logs api-configuration" -ForegroundColor White
Write-Host "3. Verify configuration files exist in GitHub repository" -ForegroundColor White
Write-Host "4. Run full verification: .\verify-config-server.ps1" -ForegroundColor White
Write-Host ""
Write-Host "For detailed help, see: CONFIG_SERVER_QUICK_FIX.md" -ForegroundColor Cyan
