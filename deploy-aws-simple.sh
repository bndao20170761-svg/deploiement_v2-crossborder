#!/bin/bash

# Script de déploiement simplifié pour AWS EC2
# Usage: bash deploy-aws-simple.sh

set -e

echo "🚀 Déploiement PVVIH sur AWS EC2"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}▶${NC} $1"
}

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé"
    exit 1
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé"
    exit 1
fi

log_info "Docker: $(docker --version)"
log_info "Docker Compose: $(docker-compose --version)"
echo ""

# Vérifier le fichier .env
if [ ! -f .env ]; then
    log_error "Fichier .env manquant!"
    echo ""
    echo "Créez le fichier .env avec:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    echo ""
    exit 1
fi

log_info "Fichier .env trouvé"
echo ""

# Récupérer l'IP publique
log_step "Récupération de l'IP publique..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s ifconfig.me)
log_info "IP publique: $PUBLIC_IP"
echo ""

# Vérifier et mettre à jour les URLs dans .env
log_step "Configuration des URLs publiques..."
if ! grep -q "PUBLIC_IP=" .env; then
    echo "PUBLIC_IP=$PUBLIC_IP" >> .env
    log_info "PUBLIC_IP ajouté"
fi

if ! grep -q "PUBLIC_URL=" .env; then
    echo "PUBLIC_URL=http://$PUBLIC_IP:8080" >> .env
    echo "FORUM_URL=http://$PUBLIC_IP:3001" >> .env
    echo "FRONTEND1_URL=http://$PUBLIC_IP:3002" >> .env
    echo "FRONTEND2_URL=http://$PUBLIC_IP:3003" >> .env
    log_info "URLs publiques ajoutées"
else
    log_info "URLs publiques déjà configurées"
fi

# Configurer CORS_ALLOWED_ORIGINS pour AWS
if ! grep -q "CORS_ALLOWED_ORIGINS=" .env; then
    echo "CORS_ALLOWED_ORIGINS=http://$PUBLIC_IP:3000,http://$PUBLIC_IP:3001,http://$PUBLIC_IP:3002,http://$PUBLIC_IP:3003,http://$PUBLIC_IP:8080" >> .env
    log_info "CORS_ALLOWED_ORIGINS ajouté"
else
    log_info "CORS_ALLOWED_ORIGINS déjà configuré"
fi
echo ""

# Arrêter les services existants
log_step "Arrêt des services existants..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down 2>/dev/null || true
log_info "Services arrêtés"
echo ""

# Nettoyer les images inutilisées (optionnel)
read -p "Voulez-vous nettoyer les images Docker inutilisées? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_step "Nettoyage des images inutilisées..."
    docker system prune -f
    log_info "Nettoyage terminé"
    echo ""
fi

# Construire les images
log_step "Construction des images Docker..."
echo "Cela peut prendre 10-20 minutes..."
echo ""

docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

log_info "Images construites avec succès"
echo ""

# Démarrer les services
log_step "Démarrage des services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

log_info "Services démarrés"
echo ""

# Attendre le démarrage
log_step "Attente du démarrage des services (60 secondes)..."
for i in {60..1}; do
    echo -ne "\rTemps restant: $i secondes  "
    sleep 1
done
echo ""
echo ""

# Vérifier l'état des services
log_step "État des services:"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
echo ""

# Tester les health checks
log_step "Test des health checks..."
echo ""

test_service() {
    local service=$1
    local port=$2
    local url="http://localhost:$port/actuator/health"
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        log_info "$service (port $port): ✓ OK"
        return 0
    else
        log_warn "$service (port $port): ⏳ En attente..."
        return 1
    fi
}

# Tester les services backend
test_service "Gateway" "8080" || true
test_service "Gestion User" "9089" || true
test_service "Gestion Reference" "9090" || true
test_service "Gestion Patient" "9091" || true
test_service "Forum" "9092" || true
echo ""

# Afficher les URLs d'accès
echo "=========================================================="
echo -e "${GREEN}✓ Déploiement terminé!${NC}"
echo "=========================================================="
echo ""
echo "🌐 URLs d'accès:"
echo ""
echo "  Gateway API:        http://$PUBLIC_IP:8080"
echo "  Eureka Dashboard:   http://$PUBLIC_IP:8761"
echo "  Frontend Forum:     http://$PUBLIC_IP:3001"
echo "  Frontend Reference: http://$PUBLIC_IP:3002"
echo "  Frontend User:      http://$PUBLIC_IP:3003"
echo ""
echo "🧪 Test rapide:"
echo ""
echo "  # Créer un utilisateur"
echo "  curl -X POST http://$PUBLIC_IP:8080/api/user-auth/register \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"username\":\"admin@test.com\",\"password\":\"admin123\",\"nom\":\"Admin\",\"prenom\":\"Test\",\"profil\":\"ADMIN\",\"nationalite\":\"Sénégalaise\",\"actif\":true}'"
echo ""
echo "  # Se connecter"
echo "  curl -X POST http://$PUBLIC_IP:8080/api/user-auth/login \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"username\":\"admin@test.com\",\"password\":\"admin123\"}'"
echo ""
echo "📊 Commandes utiles:"
echo ""
echo "  # Voir les logs"
echo "  docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo ""
echo "  # Voir l'état"
echo "  docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps"
echo ""
echo "  # Voir les ressources"
echo "  docker stats"
echo ""
echo "  # Redémarrer un service"
echo "  docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart SERVICE_NAME"
echo ""
echo "  # Arrêter tous les services"
echo "  docker-compose -f docker-compose.yml -f docker-compose.prod.yml down"
echo ""
echo "📚 Documentation: DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md"
echo ""

# Proposer de voir les logs
read -p "Voulez-vous voir les logs en temps réel? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
fi
