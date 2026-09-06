#!/bin/bash
# Script FINAL pour corriger le port 8080 SSL

echo "=========================================="
echo "🔥 CORRECTION FINALE PORT 8080 SSL"
echo "=========================================="
echo ""

echo "📋 PROBLÈME IDENTIFIÉ:"
echo "  ❌ Le port 8080 n'était pas mappé dans docker-compose.yml"
echo "  ❌ nginx-https ne pouvait pas exposer le port 8080"
echo ""
echo "✅ SOLUTION:"
echo "  1. Ajouter '8080:8080' dans les ports de nginx-https"
echo "  2. Ajouter '3003:3003' pour a-user-front"
echo "  3. Recréer le conteneur nginx-https"
echo ""
echo "=========================================="
echo ""

echo "1. Sauvegarder la configuration actuelle"
echo "----------------------------------------"
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Sauvegarde créée"
echo ""

echo "2. Vérifier que docker-compose.yml a les bons ports"
echo "----------------------------------------"
if grep -q "8080:8080" docker-compose.yml; then
    echo "✅ Port 8080 trouvé dans docker-compose.yml"
else
    echo "❌ Port 8080 MANQUANT dans docker-compose.yml"
    echo ""
    echo "AJOUTEZ CETTE LIGNE dans la section nginx-https ports:"
    echo "      - \"8080:8080\"   # Port HTTPS pour API Gateway"
    echo ""
    echo "Puis relancez ce script."
    exit 1
fi

if grep -q "3003:3003" docker-compose.yml; then
    echo "✅ Port 3003 trouvé dans docker-compose.yml"
else
    echo "⚠️  Port 3003 manquant - a-user-front ne sera pas accessible sur :3003"
fi
echo ""

echo "3. Arrêter et supprimer nginx-https"
echo "----------------------------------------"
docker compose stop nginx-https
docker compose rm -f nginx-https
echo "✅ Conteneur supprimé"
echo ""

echo "4. Recréer nginx-https avec les nouveaux ports"
echo "----------------------------------------"
docker compose up -d nginx-https
echo "✅ Conteneur recréé"
echo ""

echo "5. Attendre le démarrage (15 secondes)"
echo "----------------------------------------"
for i in {15..1}; do
    echo -ne "\rAttente: $i secondes...  "
    sleep 1
done
echo ""
echo ""

echo "6. Vérifier les ports exposés"
echo "----------------------------------------"
docker port nginx-https
echo ""

echo "7. Vérifier la configuration nginx chargée"
echo "----------------------------------------"
echo "Ports écoutés par nginx:"
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep "listen" | head -10
echo ""

echo "8. Tests de connectivité"
echo "----------------------------------------"

echo "Test 1 - Port 443 (principal):"
HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:443/ 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Port 443: HTTP $HTTP_CODE"
else
    echo "❌ Port 443: HTTP $HTTP_CODE"
fi

echo ""
echo "Test 2 - Port 3001 (a-reference-front):"
HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:3001/ 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Port 3001: HTTP $HTTP_CODE"
else
    echo "❌ Port 3001: HTTP $HTTP_CODE"
fi

echo ""
echo "Test 3 - Port 3003 (a-user-front):"
HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:3003/ 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Port 3003: HTTP $HTTP_CODE"
else
    echo "⚠️  Port 3003: HTTP $HTTP_CODE (peut-être normal si port non mappé)"
fi

echo ""
echo "Test 4 - Port 8080 (Gateway API) - TEST CRITIQUE:"
HTTP_CODE=$(timeout 5 curl -k -s -o /dev/null -w "%{http_code}" https://localhost:8080/actuator/health 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Port 8080: HTTP $HTTP_CODE - API GATEWAY FONCTIONNE!"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "❌ Port 8080: Timeout ou erreur SSL"
    echo "   → Le port n'est peut-être pas exposé correctement"
else
    echo "⚠️  Port 8080: HTTP $HTTP_CODE"
fi

echo ""
echo "Test 5 - Gateway direct (sans nginx):"
HTTP_CODE=$(docker exec gateway-pvvih curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Gateway direct: HTTP $HTTP_CODE - Le Gateway fonctionne"
else
    echo "❌ Gateway direct: HTTP $HTTP_CODE - Le Gateway a un problème"
fi

echo ""
echo "=========================================="
echo "📊 RÉSUMÉ"
echo "=========================================="
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ ✅ ✅ SUCCÈS! Le port 8080 fonctionne!"
    echo ""
    echo "🎉 URLs à tester depuis votre navigateur:"
    echo "   https://100.48.20.109:3001  (a-reference-front)"
    echo "   https://100.48.20.109:3002  (gestion-forum-front)"
    echo "   https://100.48.20.109:3003  (a-user-front)"
    echo "   https://100.48.20.109:8080/actuator/health  (Gateway)"
    echo ""
    echo "🔍 Dans DevTools (F12) → Network:"
    echo "   Les appels API devraient maintenant retourner du JSON!"
    echo ""
else
    echo "❌ Le port 8080 ne fonctionne toujours pas."
    echo ""
    echo "📋 Prochaines étapes de diagnostic:"
    echo "   1. Vérifiez les logs: docker logs nginx-https"
    echo "   2. Vérifiez les ports: docker port nginx-https"
    echo "   3. Testez depuis le serveur: curl -k https://localhost:8080/actuator/health"
    echo "   4. Vérifiez le Gateway: docker logs gateway-pvvih --tail 50"
    echo ""
fi

echo "=========================================="
