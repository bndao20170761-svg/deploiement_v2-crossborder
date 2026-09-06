# Script pour déployer le fix profil avec localStorage
# Usage: .\deploy-profil-localstorage.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Déploiement: Profil depuis localStorage" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📝 Modifications effectuées:" -ForegroundColor Yellow
Write-Host "  ✅ Login.js: Stockage données complètes dans localStorage" -ForegroundColor Green
Write-Host "  ✅ Header.js: Lecture depuis localStorage (plus d'appel API)" -ForegroundColor Green
Write-Host ""

# Étape 1 : Vérifier les modifications
Write-Host "[1/3] Vérification des fichiers modifiés...`n" -ForegroundColor Yellow
git status --short

Write-Host "`n[2/3] Push vers GitHub..." -ForegroundColor Yellow
git add a_reference_front/src/components/Login.js
git add a_reference_front/src/components/Header.js
git add FIX_PROFIL_LOCALSTORAGE.md
git commit -m "feat: récupération profil utilisateur depuis localStorage

- Login.js: Appel API /user/me après login pour récupérer données complètes
- Header.js: Lecture depuis localStorage au lieu d'appel API
- Avantages: instantané, moins de charge serveur, code plus simple"

git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Erreur lors du push GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Code poussé sur GitHub`n" -ForegroundColor Green

# Étape 3 : Instructions pour le serveur
Write-Host "[3/3] Commandes pour le serveur AWS`n" -ForegroundColor Yellow

$commands = @"
cd ~/deploiement_v2-crossborder
git pull
docker compose stop a-reference-front
docker compose build --no-cache a-reference-front
docker compose up -d a-reference-front
docker ps | grep a-reference-front
docker logs a-reference-front --tail 20
"@

Write-Host "📋 Exécutez ces commandes sur le serveur:`n" -ForegroundColor Cyan
Write-Host $commands -ForegroundColor White

# Copier dans le presse-papier
Set-Clipboard -Value $commands
Write-Host "`n✅ Commandes copiées dans le presse-papier !`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Étapes suivantes:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Connectez-vous au serveur:" -ForegroundColor Yellow
Write-Host "   ssh ec2-user@100.48.20.109`n" -ForegroundColor White
Write-Host "2. Collez les commandes (copiées)`n" -ForegroundColor Yellow
Write-Host "3. Testez dans le navigateur:" -ForegroundColor Yellow
Write-Host "   - Ouvrir https://100.48.20.109" -ForegroundColor White
Write-Host "   - F12 → Application → Clear Site Data (important !)" -ForegroundColor White
Write-Host "   - Se reconnecter" -ForegroundColor White
Write-Host "   - Le profil devrait afficher: 'Prénom Nom'`n" -ForegroundColor White

Write-Host "⚠️  IMPORTANT: Il faut se RECONNECTER (pas juste F5)" -ForegroundColor Red
Write-Host "   pour que localStorage soit rempli avec les nouvelles données`n" -ForegroundColor Red
