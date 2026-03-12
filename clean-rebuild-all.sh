#!/bin/bash

# ============================================================================
# SCRIPT DE NETTOYAGE COMPLET ET RECONSTRUCTION - GCP
# ============================================================================
# Ce script supprime tous les conteneurs, images, volumes et caches Docker
# puis reconstruit tout depuis zéro
# ============================================================================

set -e

echo "============================================================================"
echo "NETTOYAGE COMPLET ET RECONSTRUCTION DOCKER"
echo "============================================================================"
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    log_error "Le fichier .env n'existe pas!"
    log_info "Copie de .env.example vers .env..."
    cp .env.example .env
    log_warn "IMPORTANT: Modifiez le fichier .env avec vos valeurs avant de continuer!"
    read -p "Appuyez sur Entrée pour continuer après avoir modifié .env..."
fi

echo ""
log_info "Étape 1/6: Arrêt de tous les conteneurs..."
docker-compose down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

echo ""
log_info "Étape 2/6: Suppression de tous les conteneurs..."
docker rm -f $(docker ps -aq) 2>/dev/null || true

echo ""
log_info "Étape 3/6: Suppression de tous les volumes Docker..."
docker volume rm $(docker volume ls -q) 2>/dev/null || true

echo ""
log_info "Étape 4/6: Suppression de toutes les images Docker..."
docker rmi -f $(docker images -aq) 2>/dev/null || true

echo ""
log_info "Étape 5/6: Nettoyage complet du système Docker..."
docker system prune -af --volumes

echo ""
log_info "Étape 6/6: Nettoyage du cache de build..."
docker builder prune -af

echo ""
log_info "============================================================================"
log_info "NETTOYAGE TERMINÉ - DÉBUT DE LA RECONSTRUCTION"
log_info "============================================================================"
echo ""

# Pull des images de base pour accélérer le build
log_info "Téléchargement des images de base..."
docker pull mongo:7.0
docker pull mysql:8.0
docker pull node:18-alpine
docker pull nginx:alpine
docker pull maven:3.9-eclipse-temurin-17-alpine
docker pull eclipse-temurin:17-jre-alpine

echo ""
log_info "Construction des images Docker (cela peut prendre 10-15 minutes)..."
docker-compose build --no-cache --parallel

echo ""
log_info "Démarrage des services..."
docker-compose up -d

echo ""
log_info "============================================================================"
log_info "RECONSTRUCTION TERMINÉE"
log_info "============================================================================"
echo ""

# Attendre quelques secondes pour que les services démarrent
sleep 10

echo ""
log_info "Vérification de l'état des services..."
docker-compose ps

echo ""
log_info "============================================================================"
log_info "VÉRIFICATION DES LOGS"
log_info "============================================================================"
echo ""

# Vérifier les logs des services critiques
log_info "Logs de api-register:"
docker logs api-register --tail 20

echo ""
log_info "Logs de api-configuration:"
docker logs api-configuration --tail 20

echo ""
log_info "Logs de gateway-pvvih:"
docker logs gateway-pvvih --tail 20

echo ""
log_info "============================================================================"
log_info "SCRIPT TERMINÉ"
log_info "============================================================================"
echo ""
log_info "Pour vérifier les logs d'un service spécifique:"
log_info "  docker logs <nom-du-service>"
echo ""
log_info "Pour voir tous les services:"
log_info "  docker-compose ps"
echo ""
log_info "Pour arrêter tous les services:"
log_info "  docker-compose down"
echo ""
