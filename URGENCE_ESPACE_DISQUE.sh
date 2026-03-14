#!/bin/bash

echo "=== NETTOYAGE D'URGENCE - ESPACE DISQUE PLEIN ==="
echo ""

# 1. Arrêter TOUS les conteneurs immédiatement
echo "1. Arrêt de tous les conteneurs..."
docker-compose down
docker stop $(docker ps -aq) 2>/dev/null

# 2. Vérifier l'espace avant nettoyage
echo ""
echo "Espace AVANT nettoyage:"
df -h / | grep -v tmpfs

# 3. Supprimer les conteneurs arrêtés
echo ""
echo "2. Suppression des conteneurs..."
docker container prune -f

# 4. Supprimer TOUTES les images non utilisées (agressif)
echo ""
echo "3. Suppression de TOUTES les images non utilisées..."
docker image prune -a -f

# 5. Supprimer les volumes
echo ""
echo "4. Suppression des volumes..."
docker volume prune -f

# 6. Supprimer le cache de build
echo ""
echo "5. Nettoyage du cache de build..."
docker builder prune -a -f

# 7. Nettoyer les logs Docker
echo ""
echo "6. Nettoyage des logs Docker..."
sudo sh -c "truncate -s 0 /var/lib/docker/containers/*/*-json.log" 2>/dev/null

# 8. Nettoyer /tmp
echo ""
echo "7. Nettoyage de /tmp..."
sudo find /tmp -type f -atime +1 -delete 2>/dev/null
sudo rm -rf /tmp/tomcat.* 2>/dev/null

# 9. Vérifier l'espace après nettoyage
echo ""
echo "=== Espace APRÈS nettoyage ==="
df -h / | grep -v tmpfs

echo ""
echo "=== Espace Docker ==="
docker system df

echo ""
echo "=== NETTOYAGE TERMINÉ ==="
echo "Si l'espace est toujours insuffisant, vous devez:"
echo "1. Augmenter la taille du disque de votre VM GCP"
echo "2. Ou supprimer d'autres fichiers volumineux"
