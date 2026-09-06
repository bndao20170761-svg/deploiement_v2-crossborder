#!/bin/bash
# Script de diagnostic : Pourquoi l'API retourne du HTML au lieu de JSON ?

echo "=========================================="
echo "DIAGNOSTIC: API retourne HTML"
echo "=========================================="
echo ""

echo "1. Variables d'environnement du fichier .env"
echo "----------------------------------------"
cat .env | grep -E "(REACT_APP|GATEWAY)" || echo "❌ Aucune variable REACT_APP trouvée"
echo ""

echo "2. Variables d'environnement dans a-reference-front"
echo "----------------------------------------"
docker inspect a-reference-front | jq '.[0].Config.Env[]' | grep REACT_APP || echo "❌ Aucune variable REACT_APP dans le container"
echo ""

echo "3. Variables d'environnement dans a-user-front"
echo "----------------------------------------"
docker inspect a-user-front | jq '.[0].Config.Env[]' | grep REACT_APP || echo "❌ Aucune variable REACT_APP dans le container"
echo ""

echo "4. Test API Gateway (devrait retourner JSON)"
echo "----------------------------------------"
echo "GET /actuator/health:"
curl -sk https://localhost:8080/actuator/health | head -c 200
echo ""
echo ""
echo "GET /api/patients/all:"
RESPONSE=$(curl -sk https://localhost:8080/api/patients/all 2>&1)
if echo "$RESPONSE" | grep -q "<!doctype html>"; then
    echo "❌ ERREUR: API retourne du HTML !"
    echo "$RESPONSE" | head -c 200
else
    echo "✅ API retourne du JSON (ou une erreur API valide)"
    echo "$RESPONSE" | head -c 200
fi
echo ""
echo ""

echo "5. Test route / sur port 443 (devrait retourner HTML)"
echo "----------------------------------------"
RESPONSE=$(curl -sk https://localhost/ 2>&1)
if echo "$RESPONSE" | grep -q "<!doctype html>"; then
    echo "✅ Route / retourne bien du HTML du frontend"
else
    echo "❌ Route / ne retourne pas de HTML ?"
fi
echo ""

echo "6. Configuration nginx - Location blocks"
echo "----------------------------------------"
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep -A 3 "location"
echo ""

echo "7. Vérification des Dockerfiles"
echo "----------------------------------------"
echo "=== a_reference_front/Dockerfile ==="
grep -E "(ARG|ENV).*REACT_APP" a_reference_front/Dockerfile || echo "❌ Pas de REACT_APP dans Dockerfile"
echo ""
echo "=== a_user_front/Dockerfile ==="
grep -E "(ARG|ENV).*REACT_APP" a_user_front/Dockerfile || echo "❌ Pas de REACT_APP dans Dockerfile"
echo ""

echo "8. Test depuis l'intérieur du container a-reference-front"
echo "----------------------------------------"
echo "Variables d'environnement visibles:"
docker exec a-reference-front env | grep REACT_APP || echo "❌ Aucune variable REACT_APP"
echo ""
echo "Contenu du build (vérifier l'index.html):"
docker exec a-reference-front head -20 /usr/share/nginx/html/index.html
echo ""

echo "=========================================="
echo "ANALYSE ET RECOMMANDATIONS"
echo "=========================================="
echo ""

# Analyse automatique
HAS_ENV_VAR=$(cat .env 2>/dev/null | grep -c "REACT_APP_GATEWAY_URL")
API_RETURNS_HTML=$(curl -sk https://localhost:8080/api/patients/all 2>&1 | grep -c "<!doctype html>")

if [ "$API_RETURNS_HTML" -gt 0 ]; then
    echo "❌ PROBLÈME IDENTIFIÉ:"
    echo "   L'API Gateway retourne du HTML au lieu de JSON"
    echo ""
    echo "CAUSES POSSIBLES:"
    echo "   1. Le Gateway ne route pas correctement vers les microservices backend"
    echo "   2. Les microservices backend ne sont pas démarrés"
    echo "   3. Le Gateway redirige vers un frontend par erreur"
    echo ""
    echo "SOLUTION:"
    echo "   docker compose logs gateway-pvvih"
    echo "   docker ps | grep -E '(gestion-user|gestion-patient|gestion-reference)'"
fi

if [ "$HAS_ENV_VAR" -eq 0 ]; then
    echo "❌ PROBLÈME IDENTIFIÉ:"
    echo "   Pas de REACT_APP_GATEWAY_URL dans .env"
    echo ""
    echo "SOLUTION:"
    echo "   echo 'REACT_APP_GATEWAY_URL=https://100.48.20.109:8080' >> .env"
    echo "   docker compose build --no-cache a-reference-front a-user-front"
    echo "   docker compose up -d"
fi

echo ""
echo "=========================================="
echo "TESTS MANUELS À FAIRE"
echo "=========================================="
echo ""
echo "1. Depuis votre navigateur, ouvrir:"
echo "   https://100.48.20.109:3001"
echo ""
echo "2. Ouvrir DevTools (F12) → Network"
echo ""
echo "3. Recharger la page et vérifier les requêtes XHR/Fetch"
echo ""
echo "4. Chercher les requêtes vers /api/patients ou /api/hopitaux"
echo ""
echo "5. Vérifier que l'URL est:"
echo "   ✅ https://100.48.20.109:8080/api/..."
echo "   ❌ PAS https://100.48.20.109/api/..."
echo ""
echo "=========================================="
