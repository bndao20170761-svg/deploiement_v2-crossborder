#!/bin/bash

# Script de démarrage du système microservices PVVIH
# Usage: ./start.sh [dev|prod]

set -e

MODE=${1:-dev}

echo "=========================================="
echo "Démarrage du système microservices PVVIH"
echo "Mode: $MODE"
echo "=========================================="

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé"
    echo "📝 Création du fichier .env depuis .env.example..."
    cp .env.example .env
    echo "✅ Fichier .env créé. Veuillez le configurer avant de continuer."
    exit 0
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Construire les images
echo "🔨 Construction des images Docker..."
if [ "$MODE" = "prod" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
else
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
fi

# Démarrer les services
echo "🚀 Démarrage des services..."
if [ "$MODE" = "prod" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
else
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
fi

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo ""
echo "📊 État des services:"
docker-compose ps

echo ""
echo "=========================================="
echo "✅ Système démarré avec succès!"
echo "=========================================="
echo ""
echo "🌐 Accès aux services:"
echo "  - Forum Frontend:     http://localhost:3001"
echo "  - Reference Frontend: http://localhost:3002"
echo "  - User Frontend:      http://localhost:3003"
echo "  - API Gateway:        http://localhost:8080"
echo "  - Eureka Dashboard:   http://localhost:8761"
echo "  - Config Server:      http://localhost:8888"
echo ""
echo "📝 Commandes utiles:"
echo "  - Voir les logs:      docker-compose logs -f"
echo "  - Arrêter:            docker-compose down"
echo "  - Redémarrer:         docker-compose restart"
echo ""
