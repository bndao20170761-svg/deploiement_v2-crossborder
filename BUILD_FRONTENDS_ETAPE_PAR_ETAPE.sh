#!/bin/bash

# ==================== Build des Frontends Pas à Pas ====================
# Ce script build les 3 frontends un par un avec vérifications
# Usage: bash BUILD_FRONTENDS_ETAPE_PAR_ETAPE.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Build des Frontends - Étape par Étape                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    print_error "Fichier docker-compose.yml introuvable!"
    echo "Assurez-vous d'être dans le répertoire deploiement_v2-crossborder"
    exit 1
fi

# Vérifier que .env existe
if [ ! -f ".env" ]; then
    print_error "Fichier .env introuvable!"
    echo "Créez le fichier .env avec la configuration GCP"
    exit 1
fi

print_success "Fichiers de configuration trouvés"

# ==================== FRONTEND 1: gestion_forum_front (Port 3001) ====================
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  FRONTEND 1: gestion_forum_front (Port 3001)"
echo "════════════════════════════════════════════════════════════════"
echo ""

print_step "Vérification du Dockerfile..."
if [ -f "gestion_forum_front/Dockerfile" ]; then
    print_success "Dockerfile trouvé"
else
    print_error "Dockerfile introuvable dans gestion_forum_front/"
    exit 1
fi

print_step "Vérification du fichier .env..."
if [ -f "gestion_forum_front/.env" ]; then
    print_success "Fichier .env trouvé"
    echo "Configuration:"
    grep "REACT_APP_" gestion_forum_front/.env | head -3
else
    print_warning "Fichier .env introuvable, utilisation des valeurs par défaut"
fi

print_step "Build de l'image Docker gestion_forum_front..."
echo "⏱️  Temps estimé: 3-5 minutes"
echo ""

docker-compose build gestion_forum_front

if [ $? -eq 0 ]; then
    print_success "✅ Frontend Forum buildé avec succès!"
    
    # Vérifier l'image
    IMAGE_SIZE=$(docker images deploiement_v2-crossborder-gestion-forum-front --format "{{.Size}}")
    echo "   Taille de l'image: $IMAGE_SIZE"
else
    print_error "❌ Erreur lors du build du Frontend Forum"
    exit 1
fi

print_step "Démarrage du Frontend Forum..."
docker-compose up -d gestion-forum-front

sleep 10

# Vérifier que le conteneur tourne
if docker-compose ps gestion-forum-front | grep -q "Up"; then
    print_success "✅ Frontend Forum démarré!"
    echo "   URL: http://16.171.10.0:3001"
else
    print_error "❌ Le Frontend Forum n'a pas démarré correctement"
    echo "Logs:"
    docker-compose logs gestion-forum-front | tail -20
fi

# ==================== FRONTEND 2: a_reference_front (Port 3002) ====================
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  FRONTEND 2: a_reference_front (Port 3002)"
echo "════════════════════════════════════════════════════════════════"
echo ""

print_step "Vérification du Dockerfile..."
if [ -f "a_reference_front/Dockerfile" ]; then
    print_success "Dockerfile trouvé"
else
    print_error "Dockerfile introuvable dans a_reference_front/"
    exit 1
fi

print_step "Vérification du fichier .env..."
if [ -f "a_reference_front/.env" ]; then
    print_success "Fichier .env trouvé"
    echo "Configuration:"
    grep "REACT_APP_" a_reference_front/.env | head -3
else
    print_warning "Fichier .env introuvable, utilisation des valeurs par défaut"
fi

print_step "Build de l'image Docker a_reference_front..."
echo "⏱️  Temps estimé: 3-5 minutes"
echo ""

docker-compose build a-reference-front

if [ $? -eq 0 ]; then
    print_success "✅ Frontend Reference buildé avec succès!"
    
    # Vérifier l'image
    IMAGE_SIZE=$(docker images deploiement_v2-crossborder-a-reference-front --format "{{.Size}}")
    echo "   Taille de l'image: $IMAGE_SIZE"
else
    print_error "❌ Erreur lors du build du Frontend Reference"
    exit 1
fi

print_step "Démarrage du Frontend Reference..."
docker-compose up -d a-reference-front

sleep 10

# Vérifier que le conteneur tourne
if docker-compose ps a-reference-front | grep -q "Up"; then
    print_success "✅ Frontend Reference démarré!"
    echo "   URL: http://16.171.10.0:3002"
else
    print_error "❌ Le Frontend Reference n'a pas démarré correctement"
    echo "Logs:"
    docker-compose logs a-reference-front | tail -20
fi

# ==================== FRONTEND 3: a_user_front (Port 3003) ====================
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  FRONTEND 3: a_user_front (Port 3003)"
echo "════════════════════════════════════════════════════════════════"
echo ""

print_step "Vérification du Dockerfile..."
if [ -f "a_user_front/Dockerfile" ]; then
    print_success "Dockerfile trouvé"
else
    print_error "Dockerfile introuvable dans a_user_front/"
    exit 1
fi

print_step "Vérification du fichier .env..."
if [ -f "a_user_front/.env" ]; then
    print_success "Fichier .env trouvé"
    echo "Configuration:"
    grep "REACT_APP_" a_user_front/.env | head -3
else
    print_warning "Fichier .env introuvable, utilisation des valeurs par défaut"
fi

print_step "Build de l'image Docker a_user_front..."
echo "⏱️  Temps estimé: 3-5 minutes"
echo ""

docker-compose build a-user-front

if [ $? -eq 0 ]; then
    print_success "✅ Frontend User buildé avec succès!"
    
    # Vérifier l'image
    IMAGE_SIZE=$(docker images deploiement_v2-crossborder-a-user-front --format "{{.Size}}")
    echo "   Taille de l'image: $IMAGE_SIZE"
else
    print_error "❌ Erreur lors du build du Frontend User"
    exit 1
fi

print_step "Démarrage du Frontend User..."
docker-compose up -d a-user-front

sleep 10

# Vérifier que le conteneur tourne
if docker-compose ps a-user-front | grep -q "Up"; then
    print_success "✅ Frontend User démarré!"
    echo "   URL: http://16.171.10.0:3003"
else
    print_error "❌ Le Frontend User n'a pas démarré correctement"
    echo "Logs:"
    docker-compose logs a-user-front | tail -20
fi

# ==================== RÉSUMÉ ====================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Build des Frontends Terminé!                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

print_step "État des frontends:"
docker-compose ps | grep -E "gestion-forum-front|a-reference-front|a-user-front"

echo ""
print_step "Images Docker créées:"
docker images | grep -E "gestion-forum-front|a-reference-front|a-user-front"

echo ""
print_step "URLs d'accès:"
echo "   • Frontend Forum:     http://16.171.10.0:3001"
echo "   • Frontend Reference: http://16.171.10.0:3002"
echo "   • Frontend User:      http://16.171.10.0:3003"

echo ""
print_step "Tests d'accès (depuis la VM):"
echo ""

# Test Frontend Forum
if curl -f -s -o /dev/null http://localhost:3001; then
    print_success "Frontend Forum accessible"
else
    print_warning "Frontend Forum pas encore accessible"
fi

# Test Frontend Reference
if curl -f -s -o /dev/null http://localhost:3002; then
    print_warning "Frontend Reference pas encore accessible"
fi

# Test Frontend User
if curl -f -s -o /dev/null http://localhost:3003; then
    print_success "Frontend User accessible"
else
    print_warning "Frontend User pas encore accessible"
fi

echo ""
print_warning "Note: Les frontends peuvent prendre quelques secondes supplémentaires"
print_warning "pour être complètement opérationnels."

echo ""
print_step "Prochaines étapes:"
echo "   1. Tester les frontends dans votre navigateur"
echo "   2. Builder les bases de données"
echo "   3. Builder les services backend"
echo ""
