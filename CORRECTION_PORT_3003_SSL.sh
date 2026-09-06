#!/bin/bash
# Script pour corriger le port 3003 SSL manquant

echo "=========================================="
echo "CORRECTION PORT 3003 SSL"
echo "=========================================="
echo ""

cd ~/deploiement_v2-crossborder || exit 1

echo "1. Arrêt du proxy nginx-https..."
docker compose stop nginx-https

echo ""
echo "2. Suppression du conteneur nginx-https..."
docker compose rm -f nginx-https

echo ""
echo "3. Recréation du conteneur avec la nouvelle configuration..."
docker compose up -d nginx-https

echo ""
echo "4. Attendre 5 secondes que nginx démarre..."
sleep 5

echo ""
echo "5. Vérification de la configuration nginx..."
docker exec nginx-https nginx -t

echo ""
echo "6. Vérification des ports SSL configurés..."
echo "Ports SSL détectés dans la configuration:"
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep "listen.*ssl"

echo ""
echo "7. Test des ports SSL..."
echo ""
echo "Test port 443:"
timeout 3 openssl s_client -connect localhost:443 </dev/null 2>&1 | grep -E "(CONNECTED|Verify return code)" || echo "❌ Port 443 ne répond pas"

echo ""
echo "Test port 3001:"
timeout 3 openssl s_client -connect localhost:3001 </dev/null 2>&1 | grep -E "(CONNECTED|Verify return code)" || echo "❌ Port 3001 ne répond pas"

echo ""
echo "Test port 3002:"
timeout 3 openssl s_client -connect localhost:3002 </dev/null 2>&1 | grep -E "(CONNECTED|Verify return code)" || echo "❌ Port 3002 ne répond pas"

echo ""
echo "Test port 3003:"
timeout 3 openssl s_client -connect localhost:3003 </dev/null 2>&1 | grep -E "(CONNECTED|Verify return code)" || echo "❌ Port 3003 ne répond pas"

echo ""
echo "8. État final des conteneurs..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(nginx-https|front)"

echo ""
echo "=========================================="
echo "CORRECTION TERMINÉE"
echo "=========================================="
echo ""
echo "Testez maintenant depuis votre navigateur:"
echo "  https://100.48.20.109:3001  (a-reference-front)"
echo "  https://100.48.20.109:3002  (gestion-forum-front)"
echo "  https://100.48.20.109:3003  (a-user-front) ✨ NOUVEAU"
echo ""
