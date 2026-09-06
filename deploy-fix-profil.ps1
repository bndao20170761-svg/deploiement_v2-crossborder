# Script pour déployer le fix du profil utilisateur
# Usage: .\deploy-fix-profil.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX PROFIL UTILISATEUR - Déploiement" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Étape 1 : Pousser sur GitHub
Write-Host "[1/4] Push vers GitHub..." -ForegroundColor Yellow
git add a_reference_front/src/components/Header.js
git commit -m "fix: affichage correct nom/prénom utilisateur (supporte valeurs vides)"
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Erreur lors du push GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Code poussé sur GitHub`n" -ForegroundColor Green

# Étape 2 : Instructions pour le serveur
Write-Host "[2/4] Maintenant, connectez-vous au serveur AWS :`n" -ForegroundColor Yellow
Write-Host "ssh ec2-user@100.48.20.109`n" -ForegroundColor Cyan

Write-Host "[3/4] Puis exécutez ces commandes :`n" -ForegroundColor Yellow
Write-Host "cd ~/deploiement_v2-crossborder" -ForegroundColor White
Write-Host "git pull" -ForegroundColor White
Write-Host "docker compose stop a-reference-front" -ForegroundColor White
Write-Host "docker compose build --no-cache a-reference-front" -ForegroundColor White
Write-Host "docker compose up -d a-reference-front`n" -ForegroundColor White

Write-Host "[4/4] Tester dans le navigateur :" -ForegroundColor Yellow
Write-Host "https://100.48.20.109" -ForegroundColor Cyan
Write-Host "Le profil devrait maintenant afficher correctement le nom et prénom`n" -ForegroundColor White

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Commandes copiées dans le presse-papier" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Copier les commandes dans le presse-papier
$commands = @"
cd ~/deploiement_v2-crossborder
git pull
docker compose stop a-reference-front
docker compose build --no-cache a-reference-front
docker compose up -d a-reference-front
docker ps | grep a-reference-front
docker logs a-reference-front --tail 20
"@

Set-Clipboard -Value $commands
Write-Host "`n✅ Commandes copiées ! Collez-les dans votre terminal SSH`n" -ForegroundColor Green
