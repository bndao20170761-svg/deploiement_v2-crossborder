#!/bin/bash

# Script de déploiement de la correction HTTPS
# À exécuter sur le serveur AWS (IP: 100.48.20.109)

echo "=========================================="
echo "Déploiement correction HTTPS"
echo "=========================================="
echo ""

# Étape 1 : Pull des changements
echo "📥 Récupération des derniers changements..."
git pull
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du git pull"
    exit 1
fi
echo "✅ Changements récupérés"
echo ""

# Étape 2 : Redémarrage nginx-https
echo "🔄 Redémarrage de nginx-https..."
docker compose restart nginx-https
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du redémarrage de nginx-https"
    exit 1
fi
echo "✅ nginx-https redémarré"
echo ""

# Attendre que nginx démarre
echo "⏳ Attente du démarrage de nginx (10 secondes)..."
sleep 10
echo ""

# Étape 3 : Vérification
echo "🔍 Vérification du statut..."
docker ps | grep nginx-https
echo ""

echo "📋 Derniers logs nginx-https:"
docker logs nginx-https --tail 20
echo ""

echo "=========================================="
echo "✅ Déploiement terminé !"
echo "=========================================="
echo ""
echo "🧪 Tests à effectuer :"
echo "1. https://100.48.20.109/ (page principale)"
echo "2. https://100.48.20.109/user/ (page utilisateur)"
echo "3. https://100.48.20.109/forum/ (page forum)"
echo ""
echo "⚠️  N'oubliez pas de mettre à jour le fichier GETWAY_PVVIH-dev.yml"
echo "    sur GitHub pour ajouter https://100.48.20.109 dans CORS"
