# Test simple des endpoints
Write-Host "🧪 Test des endpoints..." -ForegroundColor Green

# Attendre que l'application démarre
Write-Host "⏳ Attente du démarrage..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test 1: Endpoint de test
Write-Host "`n1️⃣ Test GET /api/test" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/test" -Method GET
    Write-Host "✅ Succès: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test des sujets
Write-Host "`n2️⃣ Test GET /api/sujets" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/sujets" -Method GET
    Write-Host "✅ Succès: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Tests terminés" -ForegroundColor Green













