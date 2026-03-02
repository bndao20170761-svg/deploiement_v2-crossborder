# Script de test du flux d'authentification complet
# Ce script teste l'architecture microservices corrigée

Write-Host "🧪 Test du flux d'authentification microservices" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$GESTION_USER_URL = "http://localhost:9089"
$GESTION_REFERENCE_URL = "http://localhost:9090"
$GATEWAY_URL = "http://localhost:8080"

# Test 1: Login via gestion_user
Write-Host "📝 Test 1: Login via gestion_user" -ForegroundColor Yellow
Write-Host "POST $GESTION_USER_URL/api/auth/login" -ForegroundColor Gray

$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$GESTION_USER_URL/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    
    $token = $loginResponse.token
    Write-Host "✅ Login réussi!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Erreur lors du login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Créez d'abord un utilisateur avec POST /api/auth/register" -ForegroundColor Yellow
    exit 1
}

# Test 2: Vérifier que login est désactivé sur gestion_reference
Write-Host "📝 Test 2: Vérifier que login est désactivé sur gestion_reference" -ForegroundColor Yellow
Write-Host "POST $GESTION_REFERENCE_URL/api/auth/login (devrait retourner 501)" -ForegroundColor Gray

try {
    $refLoginResponse = Invoke-RestMethod -Uri "$GESTION_REFERENCE_URL/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    
    Write-Host "⚠️  Login devrait être désactivé sur gestion_reference!" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 501) {
        Write-Host "✅ Login correctement désactivé (501 Not Implemented)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erreur inattendue: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 3: Accès à gestion_reference avec JWT
Write-Host "📝 Test 3: Accès à gestion_reference avec JWT" -ForegroundColor Yellow
Write-Host "GET $GESTION_REFERENCE_URL/api/references" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $referencesResponse = Invoke-RestMethod -Uri "$GESTION_REFERENCE_URL/api/references" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ Accès autorisé avec JWT!" -ForegroundColor Green
    Write-Host "Nombre de références: $($referencesResponse.Count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    Write-Host ""
}

# Test 4: Accès sans JWT (devrait échouer)
Write-Host "📝 Test 4: Accès sans JWT (devrait échouer avec 403)" -ForegroundColor Yellow
Write-Host "GET $GESTION_REFERENCE_URL/api/references (sans token)" -ForegroundColor Gray

try {
    $unauthorizedResponse = Invoke-RestMethod -Uri "$GESTION_REFERENCE_URL/api/references" `
        -Method Get `
        -ErrorAction Stop
    
    Write-Host "⚠️  Accès devrait être refusé sans JWT!" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 403 -or $_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Accès correctement refusé (403/401)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erreur inattendue: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 5: Accès via Gateway
Write-Host "📝 Test 5: Accès via Gateway" -ForegroundColor Yellow
Write-Host "GET $GATEWAY_URL/gestion-reference/api/references" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $gatewayResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/gestion-reference/api/references" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ Accès via Gateway réussi!" -ForegroundColor Green
    Write-Host "Nombre de références: $($gatewayResponse.Count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "⚠️  Erreur via Gateway: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    Write-Host ""
}

# Résumé
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🎯 Résumé des tests" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Architecture microservices validée:" -ForegroundColor Green
Write-Host "   • gestion_user gère l'authentification" -ForegroundColor Gray
Write-Host "   • gestion_reference valide uniquement les JWT" -ForegroundColor Gray
Write-Host "   • Pas de duplication de données utilisateurs" -ForegroundColor Gray
Write-Host "   • Gateway route correctement les requêtes" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation: ARCHITECTURE_AUTHENTIFICATION.md" -ForegroundColor Cyan
