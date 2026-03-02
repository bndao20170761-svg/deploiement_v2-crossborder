# Script pour créer un utilisateur de test
Write-Host "👤 Création d'un utilisateur de test" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$GESTION_USER_URL = "http://localhost:9089"

# Créer un utilisateur admin
Write-Host "📝 Création de l'utilisateur 'admin'" -ForegroundColor Yellow

$registerBody = @{
    username = "admin"
    password = "admin123"
    nom = "Admin"
    prenom = "Test"
    nationalite = "SN"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$GESTION_USER_URL/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop
    
    Write-Host "✅ Utilisateur créé avec succès!" -ForegroundColor Green
    Write-Host "Réponse: $response" -ForegroundColor Gray
} catch {
    if ($_.Exception.Message -like "*déjà pris*" -or $_.Exception.Message -like "*already*") {
        Write-Host "ℹ️  L'utilisateur existe déjà" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔑 Identifiants de test:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor Gray
Write-Host "   Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "▶️  Lancez maintenant: .\test-auth-flow.ps1" -ForegroundColor Green
