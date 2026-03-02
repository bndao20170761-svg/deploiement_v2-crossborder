#!/bin/bash

# Script de déploiement rapide sur AWS EC2
# Usage: bash deploy-aws.sh

set -e

echo "🚀 Déploiement sur AWS EC2"
echo "============================"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé. Lancez d'abord: bash setup-aws-ec2.sh"
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé. Lancez d'abord: bash setup-aws-ec2.sh"
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    log_error "Fichier .env manquant. Copiez .env.example vers .env et configurez-le"
    exit 1
fi

# Récupérer l'IP publique
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s ifconfig.me)
log_info "IP publique détectée: $PUBLIC_IP"
echo ""

# Vérifier si PUBLIC_IP est dans .env
if ! grep -q "PUBLIC_IP=" .env; then
    log_warn "PUBLIC_IP non trouvé dans .env, ajout automatique..."
    echo "PUBLIC_IP=$PUBLIC_IP" >> .env
    log_info "PUBLIC_IP ajouté au fichier .env"
fi

# Arrêter les services existants
log_info "Arrêt des services existants..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
echo ""

# Pull les dernières images
log_info "Téléchargement des images Docker..."
docker-compose -f docker-compose.prod.yml pull
echo ""

# Démarrer les services
log_info "Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d
echo ""

# Attendre que les services démarrent
log_info "Attente du démarrage des services (30 secondes)..."
sleep 30
echo ""

# Vérifier l'état des services
log_info "État des services:"
docker-compose -f docker-compose.prod.yml ps
echo ""

# Tester les health checks
log_info "Test des health checks..."

test_service() {
    local service=$1
    local port=$2
    local url="http://localhost:$port/actuator/health"
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        log_info "$service: OK"
    else
        log_warn "$service: En attente..."
    fi
}

test_service "Gateway" "8080"
test_service "Gestion User" "9089"
test_service "Gestion Reference" "9090"
test_service "Gestion Patient" "9091"
test_service "Forum" "9092"
echo ""

# Afficher les URLs d'accès
echo "=========================================================="
echo -e "${GREEN}✓ Déploiement terminé!${NC}"
echo "=========================================================="
echo ""
echo "🌐 URLs d'accès:"
echo "  • Gateway API: http://$PUBLIC_IP:8080"
echo "  • Eureka Dashboard: http://$PUBLIC_IP:8761"
echo "  • Frontend Forum: http://$PUBLIC_IP:3001"
echo "  • Frontend Reference: http://$PUBLIC_IP:3002"
echo "  • Frontend User: http://$PUBLIC_IP:3003"
echo ""
echo "🧪 Test rapide:"
echo "  curl http://$PUBLIC_IP:8080/actuator/health"
echo ""
echo "📊 Surveiller les logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🔄 Redémarrer un service:"
echo "  docker-compose -f docker-compose.prod.yml restart SERVICE_NAME"
echo ""
echo "🛑 Arrêter tous les services:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
