# Script pour nettoyer COMPLÈTEMENT et reconstruire les 3 frontends
# Ce script supprime TOUT : conteneurs, images, volumes, cache

Write-Host "🧹 NETTOYAGE COMPLET ET RECONSTRUCTION DES FRONTENDS" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Liste des frontends
$frontends = @("a-reference-front", "a-user-front", "gestion-forum-front")
$imagePrefix = "vesion_2_enda_crossborder"

# 1. ARRÊTER tous les conteneurs frontend
Write-Host "`n1️⃣ Arrêt des conteneurs..." -ForegroundColor Yellow
foreach ($frontend in $frontends) {
    Write-Host "   Arrêt de $frontend..." -ForegroundColor Gray
    docker-compose stop $frontend 2>$null
}

# 2. SUPPRIMER tous les conteneurs frontend
Write-Host "`n2️⃣ Suppression des conteneurs..." -ForegroundColor Yellow
foreach ($frontend in $frontends) {
    Write-Host "   Suppression du conteneur $frontend..." -ForegroundColor Gray
    docker-compose rm -f $frontend 2>$null
}

# 3. SUPPRIMER toutes les images frontend
Write-Host "`n3️⃣ Suppression des images..." -ForegroundColor Yellow
foreach ($frontend in $frontends) {
    $imageName = "$imagePrefix-$frontend"
    Write-Host "   Suppression de l'image $imageName..." -ForegroundColor Gray
    docker rmi $imageName -f 2>$null
}

# 4. NETTOYER le cache de build Docker
Write-Host "`n4️⃣ Nettoyage du cache de build..." -ForegroundColor Yellow
docker builder prune -af

# 5. NETTOYER les volumes non utilisés
Write-Host "`n5️⃣ Nettoyage des volumes..." -ForegroundColor Yellow
docker volume prune -f

# 6. NETTOYER les réseaux non utilisés
Write-Host "`n6️⃣ Nettoyage des réseaux..." -ForegroundColor Yellow
docker network prune -f

# 7. VÉRIFIER que les images sont bien supprimées
Write-Host "`n7️⃣ Vérification de la suppression..." -ForegroundColor Yellow
$remainingImages = docker images | Select-String -Pattern "($($frontends -join '|'))"
if ($remainingImages) {
    Write-Host "   ⚠️  Images restantes détectées, suppression forcée..." -ForegroundColor Red
    foreach ($frontend in $frontends) {
        docker rmi $(docker images -q "$imagePrefix-$frontend") -f 2>$null
    }
} else {
    Write-Host "   ✅ Toutes les images ont été supprimées" -ForegroundColor Green
}

# 8. ATTENDRE 2 secondes
Write-Host "`n⏳ Pause de 2 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# 9. RECONSTRUIRE chaque frontend SANS CACHE
Write-Host "`n8️⃣ Reconstruction des frontends (cela peut prendre 5-10 minutes)..." -ForegroundColor Yellow
foreach ($frontend in $frontends) {
    Write-Host "`n   🔨 Construction de $frontend..." -ForegroundColor Cyan
    docker-compose build $frontend --no-cache --progress=plain
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $frontend construit avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de la construction de $frontend" -ForegroundColor Red
        Write-Host "   Arrêt du script" -ForegroundColor Red
        exit 1
    }
}

# 10. REDÉMARRER tous les frontends
Write-Host "`n9️⃣ Redémarrage des frontends..." -ForegroundColor Yellow
docker-compose up -d a-reference-front a-user-front gestion-forum-front

# 11. ATTENDRE 5 secondes
Write-Host "`n⏳ Attente de 5 secondes pour le démarrage..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 12. VÉRIFIER l'état des conteneurs
Write-Host "`n🔟 État des conteneurs:" -ForegroundColor Yellow
docker-compose ps | Select-String -Pattern "($($frontends -join '|'))"

# 13. AFFICHER les logs récents
Write-Host "`n📋 Logs récents (dernières 20 lignes par frontend):" -ForegroundColor Yellow
foreach ($frontend in $frontends) {
    Write-Host "`n   === $frontend ===" -ForegroundColor Cyan
    docker-compose logs --tail=20 $frontend
}

Write-Host "`n✅ TERMINÉ!" -ForegroundColor Green
Write-Host "`n📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Testez les frontends:" -ForegroundColor White
Write-Host "      - Forum:     http://localhost:3001" -ForegroundColor Gray
Write-Host "      - Reference: http://localhost:3002" -ForegroundColor Gray
Write-Host "      - User:      http://localhost:3003" -ForegroundColor Gray
Write-Host "`n   2. Vérifiez dans la console du navigateur (F12) que les URLs utilisent:" -ForegroundColor White
Write-Host "      ✅ http://localhost:8080/api/user-auth/login" -ForegroundColor Green
Write-Host "      ❌ PAS http://localhost:8081/api/api/..." -ForegroundColor Red
Write-Host "`n   3. Si vous voyez encore des erreurs, videz le cache du navigateur:" -ForegroundColor White
Write-Host "      - Chrome/Edge: Ctrl+Shift+Delete" -ForegroundColor Gray
Write-Host "      - Firefox: Ctrl+Shift+Delete" -ForegroundColor Gray
