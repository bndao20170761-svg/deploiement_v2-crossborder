# Script PowerShell pour pousser les modifications Gateway HTTPS sur GitHub

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Push Gateway HTTPS Configuration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est dans le bon dossier
if (-not (Test-Path "Getway_PVVIH")) {
    Write-Host "❌ Erreur : Dossier Getway_PVVIH non trouvé" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le dossier racine du projet" -ForegroundColor Yellow
    exit 1
}

# Afficher le fichier modifié
Write-Host "📝 Fichier modifié :" -ForegroundColor Green
Write-Host "   Getway_PVVIH/src/main/java/sn/uasz/Getway_PVVIH/config/SecurityConfig.java" -ForegroundColor White
Write-Host ""

# Vérifier que le fichier contient HTTPS
$securityConfigPath = "Getway_PVVIH\src\main\java\sn\uasz\Getway_PVVIH\config\SecurityConfig.java"
$content = Get-Content $securityConfigPath -Raw

if ($content -match "https://100.48.20.109") {
    Write-Host "✅ Vérification : HTTPS trouvé dans SecurityConfig.java" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur : HTTPS non trouvé dans SecurityConfig.java" -ForegroundColor Red
    Write-Host "   Le fichier n'a peut-être pas été modifié correctement" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📤 Ajout des fichiers à Git..." -ForegroundColor Yellow
git add Getway_PVVIH/src/main/java/sn/uasz/Getway_PVVIH/config/SecurityConfig.java
git add REBUILD_GATEWAY_HTTPS.md
git add push-gateway-https.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du git add" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

Write-Host "💾 Création du commit..." -ForegroundColor Yellow
git commit -m "feat: ajout HTTPS (https://100.48.20.109) dans CORS SecurityConfig du Gateway"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aucun changement à commiter ou erreur" -ForegroundColor Yellow
    Write-Host "   Vérifiez avec: git status" -ForegroundColor Yellow
} else {
    Write-Host "✅ Commit créé" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    Write-Host "   Vérifiez votre connexion et vos credentials GitHub" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Push réussi !" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Modifications poussées sur GitHub" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Prochaines étapes sur le serveur AWS :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SSH vers le serveur :" -ForegroundColor White
Write-Host "   ssh ec2-user@100.48.20.109" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Rebuild le Gateway :" -ForegroundColor White
Write-Host "   cd ~/deploiement_v2-crossborder" -ForegroundColor Cyan
Write-Host "   git pull" -ForegroundColor Cyan
Write-Host "   docker compose stop gateway-pvvih" -ForegroundColor Cyan
Write-Host "   docker compose build --no-cache gateway-pvvih" -ForegroundColor Cyan
Write-Host "   docker compose up -d" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Vérifier :" -ForegroundColor White
Write-Host "   docker logs gateway-pvvih --tail 50" -ForegroundColor Cyan
Write-Host ""
Write-Host "Voir REBUILD_GATEWAY_HTTPS.md pour plus de détails" -ForegroundColor Yellow
