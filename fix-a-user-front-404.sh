#!/bin/bash

# ============================================================================
# FIX: a-user-front 404 - Problème de routing basename
# ============================================================================

echo "🔧 Fix a-user-front 404..."
echo ""

# 1. Arrêter a-user-front
echo "⏸️  1. Arrêt de a-user-front..."
docker compose stop a-user-front
echo ""

# 2. Rebuild avec le nouveau nginx.conf
echo "🔨 2. Rebuild a-user-front avec nouveau nginx.conf..."
docker compose build --no-cache a-user-front
echo ""

# 3. Redémarrer
echo "▶️  3. Redémarrage..."
docker compose up -d a-user-front
echo ""

# 4. Attendre 10 secondes
echo "⏳ Attente de 10 secondes..."
sleep 10
echo ""

# 5. Vérifier
echo "✅ 5. Vérification..."
docker ps | grep a-user-front
echo ""

# 6. Test du conteneur
echo "🧪 6. Test interne du conteneur..."
docker exec a-user-front ls -la /usr/share/nginx/html/ | head -10
echo ""

# 7. Test des fichiers statiques
echo "📁 7. Test des fichiers static..."
docker exec a-user-front ls -la /usr/share/nginx/html/static/js/ | head -5
echo ""

echo "🎉 Terminé !"
echo ""
echo "Accès :"
echo "  - Via nginx-https : https://100.48.20.109/user/"
echo "  - Port direct     : http://100.48.20.109:3003"
echo ""
echo "Si ça ne marche pas, vérifiez les logs :"
echo "  docker logs a-user-front --tail 50"
echo "  docker logs nginx-https --tail 50"
