#!/bin/bash

# Script pour rebuild les frontends avec les nouvelles URLs HTTPS
# À exécuter sur le serveur AWS (100.48.20.109)

echo "=========================================="
echo "Rebuild Frontends avec URLs HTTPS"
echo "=========================================="
echo ""

echo "⚠️  Ce script va rebuilder les 3 frontends avec les URLs HTTPS"
echo "   Cela prendra environ 5-10 minutes"
echo ""
read -p "Continuer ? (o/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[OoYy]$ ]]
then
    exit 1
fi

# Arrêter les conteneurs frontends
echo "🛑 Arrêt des conteneurs frontends..."
docker compose stop a-reference-front a-user-front gestion-forum-front
echo "✅ Conteneurs arrêtés"
echo ""

# Rebuild avec --no-cache pour forcer la recopie des .env
echo "🔨 Rebuild a-reference-front..."
docker compose build --no-cache a-reference-front
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build de a-reference-front"
    exit 1
fi
echo "✅ a-reference-front rebuilt"
echo ""

echo "🔨 Rebuild a-user-front..."
docker compose build --no-cache a-user-front
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build de a-user-front"
    exit 1
fi
echo "✅ a-user-front rebuilt"
echo ""

echo "🔨 Rebuild gestion-forum-front..."
docker compose build --no-cache gestion-forum-front
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build de gestion-forum-front"
    exit 1
fi
echo "✅ gestion-forum-front rebuilt"
echo ""

# Redémarrer tous les services
echo "🚀 Redémarrage de tous les services..."
docker compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du redémarrage"
    exit 1
fi
echo "✅ Services redémarrés"
echo ""

# Attendre que tout démarre
echo "⏳ Attente du démarrage des services (30 secondes)..."
sleep 30
echo ""

# Vérification
echo "🔍 Vérification des conteneurs..."
docker ps | grep -E "a-reference-front|a-user-front|gestion-forum-front|nginx-https"
echo ""

echo "=========================================="
echo "✅ Rebuild terminé !"
echo "=========================================="
echo ""
echo "🧪 Testez maintenant :"
echo "1. https://100.48.20.109/ (page principale)"
echo "2. https://100.48.20.109/user/ (page utilisateur)"
echo "3. https://100.48.20.109/forum/ (forum)"
echo ""
echo "🔐 Essayez de vous connecter sur https://100.48.20.109/login"
echo ""
echo "📋 Logs des frontends :"
echo "   docker logs a-reference-front --tail 50"
echo "   docker logs a-user-front --tail 50"
echo "   docker logs gestion-forum-front --tail 50"
echo "   docker logs nginx-https --tail 50"
