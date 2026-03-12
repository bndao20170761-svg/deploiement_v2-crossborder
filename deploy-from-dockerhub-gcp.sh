#!/bin/bash

# ============================================================================
# SCRIPT DE DÉPLOIEMENT SUR GCP DEPUIS DOCKER HUB
# ============================================================================
# À exécuter sur votre instance GCP
# ============================================================================

set -e

echo "============================================================================"
echo "DÉPLOIEMENT DEPUIS DOCKER HUB SUR GCP"
echo "============================================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    log_warn "Le fichier .env n'existe pas!"
    log_info "Création du fichier .env..."
    
    # Obtenir l'IP externe
    EXTERNAL_IP=$(curl -s ifconfig.me)
    
    cat > .env <<EOF
# Database passwords
MONGO_PASSWORD=admin123
MYSQL_ROOT_PASSWORD=root123
MYSQL_USER_PASSWORD=user123
MYSQL_REFERENCE_PASSWORD=reference123
MYSQL_PATIENT_PASSWORD=patient123

# JWT Secret
JWT_SECRET=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==

# CORS
CORS_ALLOWED_ORIGINS=http://${EXTERNAL_IP}:3001,http://${EXTERNAL_IP}:3002,http://${EXTERNAL_IP}:3003

# Frontend URLs
REACT_APP_GATEWAY_URL=http://${EXTERNAL_IP}:8080
REACT_APP_API_URL=http://${EXTERNAL_IP}:8080
REACT_APP_USER_API_URL=http://${EXTERNAL_IP}:8080
REACT_APP_FORUM_API_URL=http://${EXTERNAL_IP}:8080
REACT_APP_AUTH_API_URL=http://${EXTERNAL_IP}:8080/api/auth
REACT_APP_FORUM_URL=http://${EXTERNAL_IP}:3001
REACT_APP_FRONTEND1_URL=http://${EXTERNAL_IP}:3002
REACT_APP_FRONTEND2_URL=http://${EXTERNAL_IP}:3003

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
EOF
    
    log_info "Fichier .env créé avec IP: ${EXTERNAL_IP}"
fi

log_info "Pull des images depuis Docker Hub..."
docker compose -f docker-compose.gcp.yml pull

log_info "Démarrage des services..."
docker compose -f docker-compose.gcp.yml up -d

echo ""
log_info "Attente du démarrage des services (30 secondes)..."
sleep 30

echo ""
log_info "État des services:"
docker compose -f docker-compose.gcp.yml ps

echo ""
log_info "============================================================================"
log_info "DÉPLOIEMENT TERMINÉ!"
log_info "============================================================================"
echo ""
log_info "Pour voir les logs:"
echo "  docker compose -f docker-compose.gcp.yml logs -f"
echo ""
