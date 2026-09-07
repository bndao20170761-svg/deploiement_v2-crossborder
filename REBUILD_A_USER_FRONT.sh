#!/bin/bash
# Script pour rebuilder a-user-front avec la correction de géolocalisation

echo "=========================================="
echo "🔧 REBUILD a-user-front (Correction Géolocalisation)"
echo "=========================================="
echo ""

echo "📋 CORRECTION APPLIQUÉE:"
echo "  ✅ Fonction locateUser() copiée depuis a-reference-front"
echo "  ✅ Gestion intelligente de la meilleure position"
echo "  ✅ Timeout global de 10 secondes"
echo "  ✅ Messages clairs à l'utilisateur"
echo ""

echo "1. Arrêter a-user-front"
echo "----------------------------------------"
docker compose stop a-user-front
echo "✅ Conteneur arrêté"
echo ""

echo "2. Reconstruire l'image (sans cache)"
echo "----------------------------------------"
docker compose build --no-cache a-user-front
echo "✅ Image reconstruite"
echo ""

echo "3. Redémarrer le conteneur"
echo "----------------------------------------"
docker compose up -d a-user-front
echo "✅ Conteneur redémarré"
echo ""

echo "4. Attendre le démarrage (15 secondes)"
echo "----------------------------------------"
for i in {15..1}; do
    echo -ne "\rAttente: $i secondes...  "
    sleep 1
done
echo ""
echo ""

echo "5. Vérifier l'état du conteneur"
echo "----------------------------------------"
docker ps --filter "name=a-user-front" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "6. Afficher les derniers logs"
echo "----------------------------------------"
docker logs a-user-front --tail 30
echo ""

echo "7. Test de connectivité"
echo "----------------------------------------"
echo "Test HTTP interne (depuis le serveur):"
HTTP_CODE=$(docker exec a-user-front curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Conteneur répond: HTTP $HTTP_CODE"
else
    echo "❌ Conteneur ne répond pas: HTTP $HTTP_CODE"
fi

echo ""
echo "Test HTTPS externe (si nginx-https est configuré):"
HTTP_CODE_EXT=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:3003/ 2>&1)
if [ "$HTTP_CODE_EXT" = "200" ]; then
    echo "✅ Port 3003 HTTPS répond: HTTP $HTTP_CODE_EXT"
else
    echo "⚠️  Port 3003 HTTPS: HTTP $HTTP_CODE_EXT (peut être normal si port non mappé)"
fi

echo ""
echo "=========================================="
echo "📊 RÉSUMÉ"
echo "=========================================="
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ ✅ ✅ SUCCÈS! a-user-front rebuilt et opérationnel"
    echo ""
    echo "🎯 URLs à tester depuis votre navigateur:"
    echo "   https://100.48.20.109:3003"
    echo ""
    echo "🗺️ Pour tester la géolocalisation:"
    echo "   1. Ouvrir https://100.48.20.109:3003"
    echo "   2. Cliquer sur le bouton de géolocalisation (icône GPS)"
    echo "   3. Autoriser l'accès à la position"
    echo "   4. La position devrait être détectée en < 10 secondes"
    echo "   5. Message: 'Position détectée avec précision...'"
    echo ""
    echo "🔍 Dans DevTools Console (F12):"
    echo "   Vous devriez voir:"
    echo "   🌍 Démarrage géolocalisation haute précision..."
    echo "   📍 Position reçue #1: ..."
    echo "   🎯 Nouvelle meilleure précision: ±XXm"
    echo "   ✅ Bonne précision atteinte..."
    echo ""
else
    echo "❌ Problème détecté lors du rebuild"
    echo ""
    echo "📋 Diagnostic à effectuer:"
    echo "   1. Vérifier les logs: docker logs a-user-front"
    echo "   2. Vérifier le build: docker compose build a-user-front"
    echo "   3. Vérifier les ports: docker port a-user-front"
    echo ""
fi

echo "=========================================="
