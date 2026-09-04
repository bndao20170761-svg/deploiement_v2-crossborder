# Script PowerShell pour déployer les modifications de géolocalisation

Write-Host "🚀 Déploiement des modifications de géolocalisation" -ForegroundColor Green
Write-Host "=" -repeat 60

# Étape 1 : Build de la nouvelle image Docker
Write-Host "`n📦 Étape 1 : Construction de la nouvelle image..." -ForegroundColor Yellow
Set-Location a_reference_front

# Build de l'image
docker build -t babacarcissedia/a_reference_front:geolocalisation-fixe .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build de l'image" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image construite avec succès" -ForegroundColor Green

# Étape 2 : Push vers Docker Hub
Write-Host "`n📤 Étape 2 : Envoi vers Docker Hub..." -ForegroundColor Yellow

# Login Docker Hub (si nécessaire)
Write-Host "Connexion à Docker Hub..." -ForegroundColor Cyan
docker login

# Push de l'image
docker push babacarcissedia/a_reference_front:geolocalisation-fixe

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du push de l'image" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image envoyée avec succès" -ForegroundColor Green

# Retour au répertoire racine
Set-Location ..

# Étape 3 : Instructions pour le serveur
Write-Host "`n📋 Étape 3 : Commandes à exécuter sur le serveur" -ForegroundColor Yellow
Write-Host "=" -repeat 60

$commandes = @"

Connectez-vous à votre serveur et exécutez :

ssh user@100.48.20.109

# Puis sur le serveur :

# 1. Aller dans le répertoire du projet
cd ~/vesion_2_enda_crossborder

# 2. Arrêter le conteneur actuel
docker-compose stop a_reference_front

# 3. Supprimer l'ancien conteneur
docker-compose rm -f a_reference_front

# 4. Télécharger la nouvelle image
docker pull babacarcissedia/a_reference_front:geolocalisation-fixe

# 5. Modifier docker-compose.yml pour utiliser la nouvelle image
# Remplacer :
#   image: babacarcissedia/a_reference_front:latest
# Par :
#   image: babacarcissedia/a_reference_front:geolocalisation-fixe

# 6. Redémarrer le conteneur
docker-compose up -d a_reference_front

# 7. Vérifier les logs
docker logs -f vesion_2_enda_crossborder-a_reference_front-1

"@

Write-Host $commandes -ForegroundColor Cyan

Write-Host "`n✅ Build et Push terminés !" -ForegroundColor Green
Write-Host "📝 Suivez les instructions ci-dessus pour mettre à jour le serveur" -ForegroundColor Yellow
