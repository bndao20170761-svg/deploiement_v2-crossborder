#!/bin/bash

echo "=== Nettoyage de l'espace Docker ==="
echo ""

# 1. Arrêter tous les conteneurs
echo "1. Arrêt des conteneurs en cours..."
docker-compose down

# 2. Supprimer les conteneurs arrêtés
echo "2. Suppression des conteneurs arrêtés..."
docker container prune -f

# 3. Supprimer les images non utilisées
echo "3. Suppression des images non utilisées..."
docker image prune -a -f

# 4. Supprimer les volumes non utilisés
echo "4. Suppression des volumes non utilisés..."
docker volume prune -f

# 5. Supprimer les réseaux non utilisés
echo "5. Suppression des réseaux non utilisés..."
docker network prune -f

# 6. Nettoyage du cache de build
echo "6. Nettoyage du cache de build..."
docker builder prune -a -f

# 7. Afficher l'espace disponible
echo ""
echo "=== Espace disque après nettoyage ==="
df -h

echo ""
echo "=== Espace Docker ==="
docker system df
