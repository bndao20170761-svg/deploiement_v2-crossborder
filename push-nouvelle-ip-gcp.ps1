# Script PowerShell pour pousser les changements de la nouvelle IP GCP sur GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mise à Jour IP GCP sur GitHub" -ForegroundColor Cyan
Write-Host "  Nouvelle IP: 34.32.116.206" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est dans un repository git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erreur: Ce n'est pas un repository Git!" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le répertoire racine du projet." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Fichiers modifiés avec la nouvelle IP:" -ForegroundColor Green
Write-Host "  ✅ .env" -ForegroundColor White
Write-Host "  ✅ .env.gcp.example" -ForegroundColor White
Write-Host "  ✅ gestion_forum_front/.env" -ForegroundColor White
Write-Host "  ✅ a_reference_front/.env" -ForegroundColor White
Write-Host "  ✅ a_user_front/.env" -ForegroundColor White
Write-Host "  ✅ setup-nouvelle-instance-gcp.sh" -ForegroundColor White
Write-Host "  ✅ DEPLOIEMENT_GCP_GUIDE.md" -ForegroundColor White
Write-Host "  ✅ NOUVELLE_INSTANCE_GCP.md" -ForegroundColor White
Write-Host "  ✅ NOUVELLE_IP_GCP_34.32.116.206.md (nouveau)" -ForegroundColor White
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Voulez-vous pousser ces changements sur GitHub? (O/N)"
if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host "❌ Opération annulée." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Ajout des fichiers modifiés..." -ForegroundColor Cyan

# Ajouter les fichiers modifiés
git add .env
git add .env.gcp.example
git add gestion_forum_front/.env
git add a_reference_front/.env
git add a_user_front/.env
git add setup-nouvelle-instance-gcp.sh
git add deploy-gcp-complet.sh
git add DEPLOIEMENT_GCP_GUIDE.md
git add NOUVELLE_INSTANCE_GCP.md
git add NOUVELLE_IP_GCP_34.32.116.206.md
git add push-nouvelle-ip-gcp.ps1

Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Créer le commit
Write-Host "📝 Création du commit..." -ForegroundColor Cyan
$commitMessage = "🔄 Mise à jour IP GCP: 34.32.116.206

- Mise à jour de tous les fichiers .env avec la nouvelle IP
- Mise à jour des scripts de déploiement
- Mise à jour de la documentation
- Ancienne IP: 34.133.155.230
- Nouvelle IP: 34.32.116.206

Fichiers modifiés:
- .env
- .env.gcp.example
- gestion_forum_front/.env
- a_reference_front/.env
- a_user_front/.env
- setup-nouvelle-instance-gcp.sh
- DEPLOIEMENT_GCP_GUIDE.md
- NOUVELLE_INSTANCE_GCP.md
- NOUVELLE_IP_GCP_34.32.116.206.md (nouveau)
"

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du commit!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Commit créé" -ForegroundColor Green
Write-Host ""

# Pousser sur GitHub
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Tentative avec 'master' au lieu de 'main'..." -ForegroundColor Yellow
    git push origin master
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors du push!" -ForegroundColor Red
        Write-Host "Vérifiez votre connexion et vos permissions GitHub." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Mise à jour réussie!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Connectez-vous à votre instance GCP:" -ForegroundColor White
Write-Host "   gcloud compute ssh VOTRE_INSTANCE --zone=VOTRE_ZONE" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Clonez le repository (ou faites un pull):" -ForegroundColor White
Write-Host "   git clone https://github.com/VOTRE_USERNAME/deploiement_v2-crossborder.git" -ForegroundColor Gray
Write-Host "   # OU si déjà cloné:" -ForegroundColor Gray
Write-Host "   cd deploiement_v2-crossborder && git pull" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configurez l'instance:" -ForegroundColor White
Write-Host "   bash setup-nouvelle-instance-gcp.sh 34.32.116.206" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Déconnectez-vous et reconnectez-vous:" -ForegroundColor White
Write-Host "   exit" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Lancez le déploiement:" -ForegroundColor White
Write-Host "   cd deploiement_v2-crossborder" -ForegroundColor Gray
Write-Host "   bash deploy-gcp-complet.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 URLs d'accès (après déploiement):" -ForegroundColor Cyan
Write-Host "   Gateway:    http://34.32.116.206:8080" -ForegroundColor White
Write-Host "   Eureka:     http://34.32.116.206:8761" -ForegroundColor White
Write-Host "   Forum:      http://34.32.116.206:3001" -ForegroundColor White
Write-Host "   Reference:  http://34.32.116.206:3002" -ForegroundColor White
Write-Host "   User:       http://34.32.116.206:3003" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - NOUVELLE_IP_GCP_34.32.116.206.md (récapitulatif complet)" -ForegroundColor White
Write-Host "   - NOUVELLE_INSTANCE_GCP.md (guide pas à pas)" -ForegroundColor White
Write-Host "   - DEPLOIEMENT_GCP_GUIDE.md (guide détaillé)" -ForegroundColor White
Write-Host ""
