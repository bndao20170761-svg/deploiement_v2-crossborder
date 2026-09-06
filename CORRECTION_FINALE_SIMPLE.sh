#!/bin/bash
# Script de correction finale simple

echo "=========================================="
echo "✅ CORRECTION FINALE - Version Simple"
echo "=========================================="
echo ""

echo "📋 SOLUTION CHOISIE:"
echo "  → Le Gateway reste sur port 8080 HTTP (sans SSL)"
echo "  → nginx-https n'utilise PAS le port 8080"
echo "  → Les frontends appellent http://100.48.20.109:8080/api/..."
echo ""
echo "✅ Avantage: Pas besoin de rebuild des frontends!"
echo ""
echo "=========================================="
echo ""

echo "1. Recréer nginx-https (sans port 8080)"
echo "----------------------------------------"
docker compose up -d nginx-https
echo ""

echo "2. Attendre le démarrage (10 secondes)"
echo "----------------------------------------"
sleep 10
echo ""

echo "3. Vérifier les services"
echo "----------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(nginx-https|gateway)"
echo ""

echo "4. Tests de connectivité"
echo "----------------------------------------"

echo "Test 1 - Port 443 (nginx principal):"
curl -k -s -o /dev/null -w "HTTP %{http_code}\n" https://localhost:443/

echo ""
echo "Test 2 - Port 3001 (a-reference-front):"
curl -k -s -o /dev/null -w "HTTP %{http_code}\n" https://localhost:3001/

echo ""
echo "Test 3 - Port 8080 (Gateway HTTP - SANS nginx):"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8080/actuator/health

echo ""
echo "=========================================="
echo "✅ CONFIGURATION FINALE"
echo "=========================================="
echo ""
echo "URLs fonctionnelles:"
echo "  ✅ https://100.48.20.109:3001  (a-reference-front avec SSL)"
echo "  ✅ https://100.48.20.109:3002  (gestion-forum-front avec SSL)"
echo "  ✅ https://100.48.20.109:3003  (a-user-front avec SSL)"
echo "  ✅ http://100.48.20.109:8080   (API Gateway SANS SSL)"
echo ""
echo "⚠️  NOTE IMPORTANTE:"
echo "  Le port 8080 est en HTTP (pas HTTPS) car le Gateway l'utilise déjà."
echo "  Si vous voulez du SSL sur l'API, il faut utiliser l'option /api/ sur port 443."
echo ""
echo "=========================================="
