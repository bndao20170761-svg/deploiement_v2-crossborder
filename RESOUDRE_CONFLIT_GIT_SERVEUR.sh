#!/bin/bash
# Script pour résoudre le conflit git et mettre à jour le serveur

echo "=========================================="
echo "🔧 Résolution Conflit Git + Mise à Jour"
echo "=========================================="
echo ""

echo "1. Sauvegarder les modifications locales"
echo "----------------------------------------"
git stash push -m "Modifications locales avant pull $(date +%Y%m%d_%H%M%S)"
echo "✅ Modifications sauvegardées dans stash"
echo ""

echo "2. Récupérer les dernières modifications de GitHub"
echo "----------------------------------------"
git pull origin main
echo "✅ Code mis à jour depuis GitHub"
echo ""

echo "3. Restaurer les modifications locales (si nécessaire)"
echo "----------------------------------------"
echo "Les modifications sont dans le stash, vous pouvez les restaurer avec:"
echo "  git stash list"
echo "  git stash pop"
echo ""

echo "4. Copier nginx-https.conf corrigé vers le conteneur"
echo "----------------------------------------"
if [ -f "nginx-https.conf" ]; then
    docker cp nginx-https.conf nginx-https:/etc/nginx/conf.d/default.conf
    echo "✅ nginx-https.conf copié dans le conteneur"
else
    echo "❌ nginx-https.conf introuvable"
fi
echo ""

echo "5. Vérifier la configuration nginx"
echo "----------------------------------------"
docker exec nginx-https nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Configuration nginx valide"
else
    echo "❌ Erreur dans la configuration nginx"
    exit 1
fi
echo ""

echo "6. Redémarrer nginx-https"
echo "----------------------------------------"
docker compose restart nginx-https
echo "✅ nginx-https redémarré"
echo ""

echo "7. Attendre que nginx soit prêt"
echo "----------------------------------------"
sleep 3
echo ""

echo "8. Vérifier les logs nginx"
echo "----------------------------------------"
docker logs nginx-https --tail 20
echo ""

echo "9. Tests de connectivité"
echo "----------------------------------------"
echo "Port 443 (principal):"
curl -k -I https://localhost:443 2>&1 | head -3

echo ""
echo "Port 3001 (a-reference-front):"
curl -k -I https://localhost:3001 2>&1 | head -3

echo ""
echo "Port 8080 (API Gateway) - TEST CRITIQUE:"
curl -k -s https://localhost:8080/actuator/health 2>&1 | head -5
echo ""

echo "=========================================="
echo "✅ MISE À JOUR TERMINÉE"
echo "=========================================="
echo ""
echo "URLs à tester depuis votre navigateur:"
echo "  https://100.48.20.109:3001  (a-reference-front)"
echo "  https://100.48.20.109:8080/actuator/health  (Gateway)"
echo ""
