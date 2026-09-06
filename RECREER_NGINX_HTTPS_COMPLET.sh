#!/bin/bash
# Script pour recréer complètement nginx-https avec la bonne configuration

echo "=========================================="
echo "🔧 RECRÉATION COMPLÈTE nginx-https"
echo "=========================================="
echo ""

echo "1. Arrêter et supprimer le conteneur actuel"
echo "----------------------------------------"
docker compose stop nginx-https
docker compose rm -f nginx-https
echo "✅ Conteneur supprimé"
echo ""

echo "2. Supprimer l'ancienne image (pour forcer un rebuild)"
echo "----------------------------------------"
docker rmi deploiement_v2-crossborder-nginx-https 2>/dev/null || echo "Image n'existait pas"
echo ""

echo "3. Recréer le conteneur avec la nouvelle configuration"
echo "----------------------------------------"
docker compose up -d nginx-https
echo "✅ Conteneur recréé"
echo ""

echo "4. Attendre le démarrage (15 secondes)"
echo "----------------------------------------"
sleep 15
echo ""

echo "5. Vérifier les logs"
echo "----------------------------------------"
docker logs nginx-https --tail 20
echo ""

echo "6. Tester la configuration chargée"
echo "----------------------------------------"
docker exec nginx-https nginx -T | grep -E "(listen|proxy_pass.*gateway)" | head -20
echo ""

echo "7. Tests de connectivité"
echo "----------------------------------------"

echo "Test port 443 (principal):"
curl -k -s -o /dev/null -w "HTTP %{http_code}\n" https://localhost:443/ 2>&1

echo ""
echo "Test port 3001 (a-reference-front):"
curl -k -s -o /dev/null -w "HTTP %{http_code}\n" https://localhost:3001/ 2>&1

echo ""
echo "Test port 8080 (Gateway) - CRITIQUE:"
timeout 5 curl -k -s -o /dev/null -w "HTTP %{http_code}\n" https://localhost:8080/actuator/health 2>&1 || echo "❌ Timeout ou erreur SSL"

echo ""
echo "Test direct Gateway (sans SSL):"
docker exec gateway-pvvih curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8080/actuator/health 2>&1

echo ""
echo "=========================================="
echo "✅ RECRÉATION TERMINÉE"
echo "=========================================="
echo ""
echo "Si le port 8080 fonctionne maintenant:"
echo "  → Testez depuis votre navigateur: https://100.48.20.109:3001"
echo ""
echo "Si le port 8080 ne fonctionne toujours pas:"
echo "  → Vérifiez docker-compose.yml section nginx-https"
echo "  → Exécutez: docker logs nginx-https -f"
echo ""
