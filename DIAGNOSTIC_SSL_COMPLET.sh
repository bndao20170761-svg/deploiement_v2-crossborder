#!/bin/bash
# Script de diagnostic SSL complet pour identifier le problème

echo "=========================================="
echo "DIAGNOSTIC SSL - Serveur GCP"
echo "=========================================="
echo ""

echo "1. État des conteneurs Docker"
echo "----------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(nginx-https|a-user-front|a-reference-front|gestion-forum-front)"
echo ""

echo "2. Configuration nginx-https actuelle"
echo "----------------------------------------"
docker exec nginx-https nginx -T 2>&1 | grep -A 5 "listen.*3003"
echo ""

echo "3. Test ports SSL depuis le serveur"
echo "----------------------------------------"
echo "Port 443 (devrait fonctionner):"
timeout 3 openssl s_client -connect localhost:443 -servername 100.48.20.109 </dev/null 2>&1 | grep -E "(CONNECTED|Verify return code)"

echo ""
echo "Port 3001 (devrait fonctionner):"
timeout 3 openssl s_client -connect localhost:3001 -servername 100.48.20.109 </dev/null 2>&1 | grep -E "(CONNECTED|Verify return code)"

echo ""
echo "Port 3003 (PROBLÉMATIQUE):"
timeout 3 openssl s_client -connect localhost:3003 -servername 100.48.20.109 </dev/null 2>&1 | grep -E "(CONNECTED|Verify return code|SSL routines)"

echo ""
echo "4. Vérification du fichier nginx-https.conf"
echo "----------------------------------------"
if docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep -q "listen 3003 ssl"; then
    echo "✅ Configuration SSL pour port 3003 trouvée"
else
    echo "❌ PAS de configuration SSL pour port 3003"
    echo ""
    echo "Configuration actuelle des ports SSL:"
    docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep "listen.*ssl"
fi

echo ""
echo "5. Test direct du conteneur a-user-front"
echo "----------------------------------------"
curl -I http://172.28.0.13/ 2>&1 | head -5

echo ""
echo "6. Logs nginx-https (20 dernières lignes)"
echo "----------------------------------------"
docker logs nginx-https --tail 20

echo ""
echo "=========================================="
echo "RÉSUMÉ DU PROBLÈME"
echo "=========================================="
echo ""
if docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep -q "listen 3003 ssl"; then
    echo "✅ Le port 3003 est configuré avec SSL dans nginx"
else
    echo "❌ PROBLÈME IDENTIFIÉ:"
    echo "   Le port 3003 N'EST PAS configuré dans nginx-https.conf"
    echo ""
    echo "SOLUTION:"
    echo "   1. Corriger nginx-https.conf pour ajouter le port 3003 SSL"
    echo "   2. Redémarrer nginx-https"
    echo ""
    echo "Ou utilisez directement: https://100.48.20.109:3001"
fi

echo ""
echo "=========================================="
