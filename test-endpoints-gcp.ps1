# Script de test des endpoints via Postman/curl
# Ce script teste tous les endpoints principaux

param(
    [string]$GCP_IP = "34.32.116.206"  # Remplacez par votre IP GCP
)

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST DES ENDPOINTS - GCP" -ForegroundColor Cyan
Write-Host "IP: $GCP_IP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour tester un endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    Write-Host "Test: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    Write-Host "Method: $Method" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
            Write-Host "Body: $Body" -ForegroundColor Gray
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "✓ SUCCESS (Status: $($response.StatusCode))" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Gray
        Write-Host $response.Content -ForegroundColor White
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
            
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Response Body: $responseBody" -ForegroundColor Red
            }
            catch {
                Write-Host "Could not read response body" -ForegroundColor Red
            }
        }
        Write-Host ""
        return $false
    }
}

# Tests de base
Write-Host "=== TESTS DE BASE ===" -ForegroundColor Magenta
Write-Host ""

Test-Endpoint -Name "API Register (Eureka)" `
    -Url "http://${GCP_IP}:8761"

Test-Endpoint -Name "API Configuration Health" `
    -Url "http://${GCP_IP}:8888/actuator/health"

Test-Endpoint -Name "Gateway Health" `
    -Url "http://${GCP_IP}:8080/actuator/health"

Test-Endpoint -Name "Gateway Routes" `
    -Url "http://${GCP_IP}:8080/actuator/gateway/routes"

# Tests des services backend directs
Write-Host "=== TESTS SERVICES DIRECTS (BYPASS GATEWAY) ===" -ForegroundColor Magenta
Write-Host ""

Test-Endpoint -Name "Gestion User Health (Direct)" `
    -Url "http://${GCP_IP}:9089/actuator/health"

Test-Endpoint -Name "Gestion Reference Health (Direct)" `
    -Url "http://${GCP_IP}:9090/actuator/health"

Test-Endpoint -Name "Gestion Patient Health (Direct)" `
    -Url "http://${GCP_IP}:9091/actuator/health"

Test-Endpoint -Name "Forum Health (Direct)" `
    -Url "http://${GCP_IP}:9092/actuator/health"

# Tests via Gateway
Write-Host "=== TESTS VIA GATEWAY ===" -ForegroundColor Magenta
Write-Host ""

# Test Login (devrait retourner 401 ou 400 avec credentials invalides)
$loginBody = @{
    username = "test@test.com"
    password = "test123"
} | ConvertTo-Json

Test-Endpoint -Name "Login via Gateway" `
    -Url "http://${GCP_IP}:8080/api/auth/login" `
    -Method "POST" `
    -Body $loginBody

# Test Register
$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "Test123!"
    nom = "Test"
    prenom = "User"
    role = "PATIENT"
} | ConvertTo-Json

Test-Endpoint -Name "Register via Gateway" `
    -Url "http://${GCP_IP}:8080/api/auth/register" `
    -Method "POST" `
    -Body $registerBody

# Test GET endpoints (peuvent nécessiter auth)
Test-Endpoint -Name "Get Users via Gateway" `
    -Url "http://${GCP_IP}:8080/api/users"

Test-Endpoint -Name "Get Hopitaux via Gateway" `
    -Url "http://${GCP_IP}:8080/api/hospitaux"

Test-Endpoint -Name "Get References via Gateway" `
    -Url "http://${GCP_IP}:8080/api/references"

# Tests des frontends
Write-Host "=== TESTS FRONTENDS ===" -ForegroundColor Magenta
Write-Host ""

Test-Endpoint -Name "Forum Frontend" `
    -Url "http://${GCP_IP}:3001"

Test-Endpoint -Name "Reference Frontend" `
    -Url "http://${GCP_IP}:3002"

Test-Endpoint -Name "User Frontend" `
    -Url "http://${GCP_IP}:3003"

# Test CORS
Write-Host "=== TEST CORS ===" -ForegroundColor Magenta
Write-Host ""

$corsHeaders = @{
    "Origin" = "http://${GCP_IP}:3001"
    "Access-Control-Request-Method" = "POST"
    "Access-Control-Request-Headers" = "Content-Type"
}

Test-Endpoint -Name "CORS Preflight" `
    -Url "http://${GCP_IP}:8080/api/auth/login" `
    -Method "OPTIONS" `
    -Headers $corsHeaders

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTS TERMINES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si tous les tests échouent:" -ForegroundColor Yellow
Write-Host "1. Vérifiez que les services sont démarrés: ssh user@$GCP_IP 'docker ps'" -ForegroundColor Gray
Write-Host "2. Vérifiez les règles de pare-feu GCP" -ForegroundColor Gray
Write-Host "3. Exécutez le script de diagnostic: .\diagnostic-gcp.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Si certains tests échouent:" -ForegroundColor Yellow
Write-Host "1. Vérifiez les logs du service concerné" -ForegroundColor Gray
Write-Host "2. Vérifiez la configuration de la Gateway" -ForegroundColor Gray
Write-Host "3. Consultez le guide: GUIDE_DEPANNAGE_GCP.md" -ForegroundColor Gray
