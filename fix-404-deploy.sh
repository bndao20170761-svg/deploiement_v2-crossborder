#!/bin/bash

# ============================================================================
# Script de correction de l'erreur 404 sur /user/ et /forum/
# ============================================================================

set -e  # Arrêt en cas d'erreur

echo "🚀 Début de la correction..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier qu'on est dans le bon dossier
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erreur: docker-compose.yml non trouvé${NC}"
    echo "Veuillez exécuter ce script depuis ~/deploiement_v2-crossborder"
    exit 1
fi

echo "📥 1. Pull des derniers changements depuis GitHub..."
git pull
echo -e "${GREEN}✅ Git pull OK${NC}"
echo ""

echo "🛑 2. Arrêt des services concernés..."
docker compose stop nginx-https a-user-front gestion-forum-front
echo -e "${GREEN}✅ Services arrêtés${NC}"
echo ""

echo "🏗️  3. Rebuild des frontends (sans cache)..."
echo "   Cela peut prendre 2-3 minutes..."
docker compose build --no-cache a-user-front gestion-forum-front
echo -e "${GREEN}✅ Build terminé${NC}"
echo ""

echo "▶️  4. Redémarrage de tous les services..."
docker compose up -d
echo -e "${GREEN}✅ Services redémarrés${NC}"
echo ""

echo "⏳ 5. Attente de 20 secondes pour que les services démarrent..."
for i in {20..1}; do
    echo -ne "\r   ${YELLOW}$i secondes restantes...${NC}"
    sleep 1
done
echo ""
echo -e "${GREEN}✅ Attente terminée${NC}"
echo ""

echo "🔍 6. Vérification de l'état des services..."
docker ps | grep -E "nginx-https|a-user-front|gestion-forum-front" --color=always
echo ""

echo "📋 7. Logs nginx (dernières lignes)..."
docker logs nginx-https --tail 10
echo ""

echo "📋 8. Logs a-user-front (dernières lignes)..."
docker logs a-user-front --tail 10
echo ""

echo "📋 9. Logs gestion-forum-front (dernières lignes)..."
docker logs gestion-forum-front --tail 10
echo ""

echo "============================================================================"
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo "============================================================================"
echo ""
echo "🧪 Tests à effectuer :"
echo ""
echo "1. Page d'accueil :"
echo "   https://100.48.20.109/"
echo ""
echo "2. Interface utilisateur :"
echo "   https://100.48.20.109/user/"
echo ""
echo "3. Forum :"
echo "   https://100.48.20.109/forum/"
echo ""
echo "4. API Gateway :"
echo "   https://100.48.20.109/api/auth/health"
echo ""
echo "⚠️  N'oubliez pas de vider le cache du navigateur :"
echo "   Windows/Linux: Ctrl + Shift + R"
echo "   Mac: Cmd + Shift + R"
echo ""
echo "🔍 Pour voir les logs en temps réel :"
echo "   docker logs -f nginx-https"
echo "   docker logs -f a-user-front"
echo "   docker logs -f gestion-forum-front"
echo ""
