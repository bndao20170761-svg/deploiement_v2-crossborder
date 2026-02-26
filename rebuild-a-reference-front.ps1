# Script pour reconstruire a-reference-front proprement

Write-Host "🔧 Reconstruction de a-reference-front..." -ForegroundColor Cyan

# 1. Arrêter le conteneur
Write-Host "`n1️⃣ Arrêt du conteneur..." -ForegroundColor Yellow
docker-compose stop a-reference-front

# 2. Supprimer le conteneur
Write-Host "`n2️⃣ Suppression du conteneur..." -ForegroundColor Yellow
docker-compose rm -f a-reference-front

# 3. Supprimer l'image
Write-Host "`n3️⃣ Suppression de l'image..." -ForegroundColor Yellow
docker rmi vesion_2_enda_crossborder-a-reference-front -f

# 4. Nettoyer le cache de build
Write-Host "`n4️⃣ Nettoyage du cache..." -ForegroundColor Yellow
docker builder prune -f

# 5. Reconstruire sans cache
Write-Host "`n5️⃣ Reconstruction sans cache..." -ForegroundColor Yellow
docker-compose build a-reference-front --no-cache

# 6. Redémarrer
Write-Host "`n6️⃣ Redémarrage..." -ForegroundColor Yellow
docker-compose up -d a-reference-front

# 7. Attendre 5 secondes
Write-Host "`n⏳ Attente de 5 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 8. Afficher les logs
Write-Host "`n8️⃣ Logs du conteneur:" -ForegroundColor Yellow
docker-compose logs --tail=50 a-reference-front

Write-Host "`n✅ Terminé!" -ForegroundColor Green
Write-Host "`n📝 Testez maintenant:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3002" -ForegroundColor White
Write-Host "   - Login devrait utiliser: http://localhost:8080/api/user-auth/login" -ForegroundColor White
