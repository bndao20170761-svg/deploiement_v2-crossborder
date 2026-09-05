#!/bin/bash

echo "🔧 Correction de la configuration Nginx HTTPS"
echo "=============================================="

cd /home/ec2-user/deploiement_v2-crossborder

# 1. Pull les dernières modifications
echo "📥 Récupération des modifications depuis GitHub..."
git pull

# 2. Redémarrer le conteneur nginx-https
echo "🔄 Redémarrage du conteneur nginx-https..."
docker restart nginx-https

# 3. Attendre que nginx démarre
echo "⏳ Attente du démarrage de nginx..."
sleep 5

# 4. Vérifier les logs
echo "📋 Vérification des logs nginx..."
docker logs nginx-https --tail 20

echo ""
echo "✅ Terminé ! Testez maintenant : https://100.48.20.109/user"
