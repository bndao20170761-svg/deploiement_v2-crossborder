# Script de diagnostic pour déploiement GCP
# Ce script teste tous les services et affiche les logs pour identifier les problèmes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC DEPLOIEMENT GCP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Remplacez par votre IP GCP
$GCP_IP = "34.32.116.206"  # Mettez votre IP GCP ici
$SSH_USER = "babacarndao615"
$DEPLOY_DIR = "~/deploiement_v2-crossborder"

Write-Host "1. Vérification des conteneurs en cours d'exécution..." -ForegroundColor Yellow
ssh ${SSH_USER}@${GCP_IP} "cd $DEPLOY_DIR && docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
Write-Host ""

Write-Host "2. Vérification de l'état de santé (health checks)..." -ForegroundColor Yellow
ssh ${SSH_USER}@${GCP_IP} "cd $DEPLOY_DIR && docker ps -a --format 'table {{.Names}}\t{{.Status}}'"
Write-Host ""

Write-Host "3. Test de l'API Register (Eureka)..." -ForegroundColor Yellow
Write-Host "URL: http://${GCP_IP}:8761" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://${GCP_IP}:8761" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ API Register accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ API Register non accessible: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "4. Test de l'API Configuration..." -ForegroundColor Yellow
Write-Host "URL: http://${GCP_IP}:8888/actuator/health" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://${GCP_IP}:8888/actuator/health" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ API Configuration accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "✗ API Configuration non accessible: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "5. Test de la Gateway..." -ForegroundColor Yellow
Write-Host "URL: http://${GCP_IP}:8080/actuator/health" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://${GCP_IP}:8080/actuator/health" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ Gateway accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Gateway non accessible: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "6. Vérification des services enregistrés dans Eureka..." -ForegroundColor Yellow
ssh ${SSH_USER}@${GCP_IP} "cd $DEPLOY_DIR && docker logs api-register 2>&1 | grep -i 'registered' | tail -20"
Write-Host ""

Write-Host "7. Logs de la Gateway (dernières 30 lignes)..." -ForegroundColor Yellow
ssh ${SSH_USER}@${GCP_IP} "cd $DEPLOY_DIR && docker logs gateway-pvvih 2>&1 | tail -30"
Write-Host ""

Write-Host "8. Logs de l'API Configuration (dernières 30 lignes)..." -ForegroundColor Yellow
ssh ${SSH_USER}@${GCP_IP} "cd $DEPLOY_DIR && docker logs api-configuration 2>&1 | tail -30"
Write-Host ""

Write-Host "9. Test d'un endpoint via la Gateway..." -ForegroundColor Yellow
Write-Host "URL: http://${GCP_IP}:8080/api/auth/login" -ForegroundColor Gray
try {
    $body = @{
        username = "test@test.com"
        password = "test123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://${GCP_IP}:8080/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10 `
        -UseBasicParsing
    Write-Host "✓ Endpoint accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Endpoint non accessible: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "10. Vérification des routes de la Gateway..." -ForegroundColor Yellow
Write-Host "URL: http://${GCP_IP}:8080/actuator/gateway/routes" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://${GCP_IP}:8080/actuator/gateway/routes" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ Routes accessibles" -ForegroundColor Green
    $routes = $response.Content | ConvertFrom-Json
    Write-Host "Nombre de routes: $($routes.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Routes non accessibles: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC TERMINE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
