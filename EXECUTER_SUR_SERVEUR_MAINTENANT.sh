#!/bin/bash
# Script à exécuter sur le serveur GCP pour corriger le port 3003

echo "=============================================="
echo "CORRECTION PORT 3003 - Exécution Automatique"
echo "=============================================="
echo ""

cd ~/deploiement_v2-crossborder || exit 1

echo "✅ Répertoire: $(pwd)"
echo ""

echo "1. Arrêt des services concernés..."
docker compose stop a-user-front nginx-https
echo ""

echo "2. Suppression des conteneurs..."
docker compose rm -f a-user-front nginx-https
echo ""

echo "3. Redémarrage avec la nouvelle configuration..."
docker compose up -d a-user-front nginx-https
echo ""

echo "4. Attendre que les services démarrent (10 secondes)..."
sleep 10
echo ""

echo "5. Vérification des conteneurs..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(nginx-https|a-user-front)"
echo ""

echo "6. Vérification de la configuration nginx (port 3003 SSL)..."
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep "listen.*3003"
echo ""

echo "7. Test HTTPS depuis le serveur..."
echo "Test: https://localhost:3003/"
timeout 5 curl -k -I https://localhost:3003/ 2>&1 | head -10
echo ""

echo "=============================================="
echo "✅ CORRECTION TERMINÉE"
echo "=============================================="
echo ""
echo "Testez maintenant depuis votre navigateur:"
echo "  👉 https://100.48.20.109:3003"
echo ""
echo "Note: Acceptez l'avertissement de certificat (certificat auto-signé)"
echo ""
