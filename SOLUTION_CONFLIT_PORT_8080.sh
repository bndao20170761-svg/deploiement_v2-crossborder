#!/bin/bash
# Solution au conflit de port 8080

echo "=========================================="
echo "🔧 RÉSOLUTION CONFLIT PORT 8080"
echo "=========================================="
echo ""

echo "PROBLÈME IDENTIFIÉ:"
echo "  ❌ gateway-pvvih utilise déjà le port 8080 (HTTP)"
echo "  ❌ nginx-https ne peut pas utiliser le même port"
echo ""
echo "SOLUTION:"
echo "  ✅ Gateway reste sur port 8080 (HTTP interne)"
echo "  ✅ nginx-https va mapper 8443:8080 (HTTPS externe)"
echo "  ✅ Les frontends appelleront https://IP:8443 au lieu de :8080"
echo ""
echo "=========================================="
echo ""

echo "1. Vérifier quel service utilise le port 8080"
echo "----------------------------------------"
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "8080"
echo ""

echo "2. Arrêter nginx-https temporairement"
echo "----------------------------------------"
docker compose stop nginx-https 2>/dev/null
echo "✅ nginx-https arrêté"
echo ""

echo "3. Tester l'accès direct au Gateway (sans nginx)"
echo "----------------------------------------"
echo "Test: http://localhost:8080/actuator/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Gateway fonctionne sur port 8080 (HTTP)"
else
    echo "❌ Gateway ne répond pas: HTTP $HTTP_CODE"
fi
echo ""

echo "=========================================="
echo "📋 PROCHAINES ÉTAPES"
echo "=========================================="
echo ""
echo "OPTION 1: Utiliser le port 8080 direct (sans SSL)"
echo "  → Les frontends appellent http://100.48.20.109:8080"
echo "  → Pas de SSL sur l'API (mais OK si réseau interne)"
echo ""
echo "OPTION 2: Nginx avec port 8443 pour SSL"
echo "  → nginx-https mappe 8443:8080 avec SSL"
echo "  → Les frontends appellent https://100.48.20.109:8443"
echo "  → Nécessite rebuild des frontends avec nouveau port"
echo ""
echo "OPTION 3: Nginx en reverse proxy sur /api/"
echo "  → https://100.48.20.109/api/ → gateway:8080"
echo "  → Pas de port séparé"
echo "  → Nécessite rebuild des frontends pour utiliser /api/"
echo ""
echo "=========================================="
echo ""
echo "QUELLE OPTION VOULEZ-VOUS?"
echo ""
