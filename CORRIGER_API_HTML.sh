#!/bin/bash
# Script de correction : Forcer les bons environnements et rebuilder

echo "=========================================="
echo "CORRECTION: API retourne HTML → JSON"
echo "=========================================="
echo ""

echo "1. Mise à jour du fichier .env"
echo "----------------------------------------"

# Backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# S'assurer que les variables sont correctes
if ! grep -q "REACT_APP_GATEWAY_URL" .env; then
    echo "REACT_APP_GATEWAY_URL=https://100.48.20.109:8080" >> .env
    echo "✅ REACT_APP_GATEWAY_URL ajoutée"
else
    sed -i 's|REACT_APP_GATEWAY_URL=.*|REACT_APP_GATEWAY_URL=https://100.48.20.109:8080|g' .env
    echo "✅ REACT_APP_GATEWAY_URL mise à jour"
fi

if ! grep -q "REACT_APP_API_BASE_URL" .env; then
    echo "REACT_APP_API_BASE_URL=https://100.48.20.109:8080" >> .env
    echo "✅ REACT_APP_API_BASE_URL ajoutée"
else
    sed -i 's|REACT_APP_API_BASE_URL=.*|REACT_APP_API_BASE_URL=https://100.48.20.109:8080|g' .env
    echo "✅ REACT_APP_API_BASE_URL mise à jour"
fi

echo ""
echo "Contenu .env (variables REACT_APP):"
grep "REACT_APP" .env
echo ""

echo "2. Rebuild des frontends avec les bonnes variables"
echo "----------------------------------------"
echo "Cela peut prendre 5-10 minutes..."
echo ""

docker compose build --no-cache \
  --build-arg REACT_APP_GATEWAY_URL=https://100.48.20.109:8080 \
  --build-arg REACT_APP_API_BASE_URL=https://100.48.20.109:8080 \
  --build-arg REACT_APP_USER_API_URL=https://100.48.20.109:8080 \
  a-reference-front a-user-front gestion-forum-front

if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
else
    echo "❌ Erreur lors du build"
    exit 1
fi

echo ""
echo "3. Redémarrage des services"
echo "----------------------------------------"
docker compose up -d a-reference-front a-user-front gestion-forum-front nginx-https

echo "Attente 10 secondes pour le démarrage..."
sleep 10

echo ""
echo "4. Vérification des services"
echo "----------------------------------------"
docker ps | grep -E "(a-reference-front|a-user-front|gestion-forum-front|nginx-https)"

echo ""
echo "5. Test de l'API Gateway"
echo "----------------------------------------"
echo "GET /actuator/health:"
curl -sk https://localhost:8080/actuator/health | jq . 2>/dev/null || curl -sk https://localhost:8080/actuator/health
echo ""

echo ""
echo "6. Vérification des variables dans les containers"
echo "----------------------------------------"
echo "=== a-reference-front ==="
docker exec a-reference-front env | grep REACT_APP || echo "❌ Pas de REACT_APP"
echo ""
echo "=== a-user-front ==="
docker exec a-user-front env | grep REACT_APP || echo "❌ Pas de REACT_APP"
echo ""

echo "=========================================="
echo "CORRECTION TERMINÉE"
echo "=========================================="
echo ""
echo "TESTS À FAIRE:"
echo ""
echo "1. Ouvrir https://100.48.20.109:3001 dans le navigateur"
echo "2. Ouvrir DevTools (F12) → Console"
echo "3. Vérifier qu'il n'y a plus d'erreurs 'r.filter is not a function'"
echo "4. Vérifier dans Network que les APIs retournent du JSON"
echo ""
echo "Si le problème persiste:"
echo "  - Exécutez: bash DIAGNOSTIC_API_HTML.sh"
echo "  - Vérifiez les logs: docker logs a-reference-front"
echo ""
