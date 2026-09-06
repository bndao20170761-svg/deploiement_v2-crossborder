#!/bin/bash
# Test immédiat à exécuter sur le serveur AWS

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  TEST RAPIDE - a-user-front sur le port 3003              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "1️⃣  Vérification du conteneur..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|a-user-front"
echo ""

echo "2️⃣  Test HTTP local (port 3003)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3003
echo ""

echo "3️⃣  Test HTTPS via nginx /user/ (ignorant SSL)..."
curl -k -s -o /dev/null -w "Status: %{http_code}\n" https://localhost/user/
echo ""

echo "4️⃣  Vérification du port 3003 en écoute..."
if ss -tlnp 2>/dev/null | grep -q :3003; then
    echo "✅ Port 3003 ÉCOUTE"
    ss -tlnp | grep :3003
elif netstat -tlnp 2>/dev/null | grep -q :3003; then
    echo "✅ Port 3003 ÉCOUTE"
    netstat -tlnp | grep :3003
else
    echo "❌ Port 3003 N'ÉCOUTE PAS"
fi
echo ""

echo "5️⃣  Test depuis l'IP publique..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://100.48.20.109:3003 2>&1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ SUCCÈS - Port 3003 accessible depuis l'extérieur"
    echo "   HTTP Status: $HTTP_CODE"
else
    echo "⚠️  Port 3003 pas encore accessible depuis l'extérieur"
    echo "   HTTP Status: $HTTP_CODE"
    echo ""
    echo "   👉 Action requise: Ouvrir le port 3003 dans AWS Security Groups"
    echo "   📖 Voir le fichier: OUVRIR_PORT_3003_AWS.md"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  RÉSUMÉ                                                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 URLs d'accès :"
echo "   • Via nginx-https: https://100.48.20.109/user/"
echo "   • Accès direct:    http://100.48.20.109:3003"
echo ""
echo "🔒 Sécurité :"
echo "   • nginx-https (443) : ✅ HTTPS avec certificat SSL"
echo "   • Port 3003         : ⚠️  HTTP sans chiffrement"
echo ""
echo "💡 Recommandation :"
echo "   Pour la production, utilisez: https://100.48.20.109/user/"
echo ""
