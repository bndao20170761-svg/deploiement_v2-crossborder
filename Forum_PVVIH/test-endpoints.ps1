# Script de test pour les endpoints
Write-Host "🧪 Test des endpoints du Forum PVVIH" -ForegroundColor Green

# Attendre que l'application démarre
Write-Host "⏳ Attente du démarrage de l'application..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test 1: Endpoint de test (sans authentification)
Write-Host "`n1️⃣ Test GET /api/test (sans auth)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test" -Method GET
    Write-Host "✅ Succès: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Endpoint de test POST
Write-Host "`n2️⃣ Test POST /api/test" -ForegroundColor Cyan
try {
    $body = @{ message = "Test message" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Succès: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test des sujets (avec authentification requise)
Write-Host "`n3️⃣ Test GET /api/sujets (avec auth requise)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/sujets" -Method GET
    Write-Host "✅ Succès: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur attendue (auth requise): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🏁 Tests terminés" -ForegroundColor Green













