#!/bin/bash

# Script d'arrêt du système microservices PVVIH
# Usage: ./stop.sh [--volumes]

set -e

echo "=========================================="
echo "Arrêt du système microservices PVVIH"
echo "=========================================="

if [ "$1" = "--volumes" ]; then
    echo "🗑️  Suppression des volumes..."
    docker-compose down -v
    echo "✅ Services arrêtés et volumes supprimés"
else
    docker-compose down
    echo "✅ Services arrêtés (volumes conservés)"
fi

echo ""
echo "📊 Conteneurs restants:"
docker ps -a | grep pvvih || echo "Aucun conteneur PVVIH en cours d'exécution"
echo ""
