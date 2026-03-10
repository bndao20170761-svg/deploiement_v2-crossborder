#!/bin/bash

# ==================== Script de Déploiement Complet GCP ====================
# Ce script déploie automatiquement toute l'application sur GCP
# Usage: bash deploy-gcp-complet.sh

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

# Vérifier que .env existe
if [ ! -f ".env" ]; then
    print_error "Fichier .env introuvable!"
    echo "Exécutez d'abord: bash setup-nouvelle-instance-gcp.sh VOTRE_IP"
    exit 1
fi

# Récupérer l'IP depuis .env
PUBLIC_IP=$(grep "^PUBLIC_IP=" .env | cut -d'=' -f2)

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Déploiement Complet sur GCP                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "IP Publique: $PUBLIC_IP"
echo ""

# ==================== ÉTAPE 1: Nettoyage ====================
print_step "ÉTAPE 1: Nettoyage des conteneurs existants"

docker-compose down 2>/dev/null || true
docker system prune -f

print_success "Nettoyage terminé"

# ==================== ÉTAPE 2: Bases de Données ====================
print_step "ÉTAPE 2: Démarrage des bases de données"

print_step "Démarrage de MongoDB..."
docker-compose up -d mongodb
sleep 30

print_step "Démarrage de MySQL User..."
docker-compose up -d mysql-user
sleep 30

print_step "Démarrage de MySQL Reference..."
docker-compose up -d mysql-reference
sleep 30

print_step "Démarrage de MySQL Patient..."
docker-compose up -d mysql-patient
sleep 30

print_success "Bases de données démarrées"
docker-compose ps | grep -E "mongodb|mysql"

# ==================== ÉTAPE 3: Services Edge ====================
print_step "ÉTAPE 3: Build et démarrage des services Edge"

print_step "Build et démarrage d'Eureka..."
docker-compose build api-register
docker-compose up -d api-register
sleep 60

print_step "Build et démarrage du Config Server..."
docker-compose build api-configuration
docker-compose up -d api-configuration
sleep 60

print_step "Build et démarrage du Gateway..."
docker-compose build gateway-pvvih
docker-compose up -d gateway-pvvih
sleep 60

print_success "Services Edge démarrés"
docker-compose ps | grep -E "api-register|api-configuration|gateway"

# Test Gateway
print_step "Test du Gateway..."
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    print_success "Gateway opérationnel!"
else
    print_warning "Gateway pas encore prêt, continuons..."
fi

# ==================== ÉTAPE 4: Services Backend ====================
print_step "ÉTAPE 4: Build et démarrage des services Backend"

print_step "Build et démarrage du Service User..."
docker-compose build gestion-user
docker-compose up -d gestion-user
sleep 90

print_step "Build et démarrage du Service Reference..."
docker-compose build gestion-reference
docker-compose up -d gestion-reference
sleep 90

print_step "Build et démarrage du Service Patient..."
docker-compose build gestion-patient
docker-compose up -d gestion-patient
sleep 90

print_step "Build et démarrage du Service Forum..."
docker-compose build forum-pvvih
docker-compose up -d forum-pvvih
sleep 90

print_success "Services Backend démarrés"
docker-compose ps | grep -E "gestion|forum"

# ==================== ÉTAPE 5: Frontends ====================
print_step "ÉTAPE 5: Build et démarrage des Frontends"

print_step "Build du Frontend Forum..."
docker-compose build gestion-forum-front
docker-compose up -d gestion-forum-front
sleep 10

print_step "Build du Frontend Reference..."
docker-compose build a-reference-front
docker-compose up -d a-reference-front
sleep 10

print_step "Build du Frontend User..."
docker-compose build a-user-front
docker-compose up -d a-user-front
sleep 10

print_success "Frontends démarrés"
docker-compose ps | grep front

# ==================== ÉTAPE 6: Vérifications ====================
print_step "ÉTAPE 6: Vérifications finales"

echo ""
print_step "État de tous les services:"
docker-compose ps

echo ""
print_step "Test des health checks..."

# Gateway
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    print_success "Gateway: OK"
else
    print_error "Gateway: ERREUR"
fi

# Service User
if curl -f http://localhost:9089/actuator/health > /dev/null 2>&1; then
    print_success "Service User: OK"
else
    print_warning "Service User: En cours de démarrage..."
fi

# Service Reference
if curl -f http://localhost:9090/actuator/health > /dev/null 2>&1; then
    print_success "Service Reference: OK"
else
    print_warning "Service Reference: En cours de démarrage..."
fi

# Service Patient
if curl -f http://localhost:9091/actuator/health > /dev/null 2>&1; then
    print_success "Service Patient: OK"
else
    print_warning "Service Patient: En cours de démarrage..."
fi

# Service Forum
if curl -f http://localhost:9092/actuator/health > /dev/null 2>&1; then
    print_success "Service Forum: OK"
else
    print_warning "Service Forum: En cours de démarrage..."
fi

# Frontends
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    print_success "Frontend Forum: OK"
else
    print_warning "Frontend Forum: En cours de démarrage..."
fi

if curl -f http://localhost:3002 > /dev/null 2>&1; then
    print_success "Frontend Reference: OK"
else
    print_warning "Frontend Reference: En cours de démarrage..."
fi

if curl -f http://localhost:3003 > /dev/null 2>&1; then
    print_success "Frontend User: OK"
else
    print_warning "Frontend User: En cours de démarrage..."
fi

# ==================== RÉSUMÉ ====================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Déploiement Terminé!                                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
print_success "Tous les services sont démarrés!"
echo ""
echo "🌐 URLs d'accès:"
echo ""
echo "   Gateway API:        http://$PUBLIC_IP:8080"
echo "   Eureka Dashboard:   http://$PUBLIC_IP:8761"
echo "   Frontend Forum:     http://$PUBLIC_IP:3001"
echo "   Frontend Reference: http://$PUBLIC_IP:3002"
echo "   Frontend User:      http://$PUBLIC_IP:3003"
echo ""
echo "📋 Commandes utiles:"
echo ""
echo "   Voir tous les services:     docker-compose ps"
echo "   Voir les logs:              docker-compose logs -f"
echo "   Redémarrer un service:      docker-compose restart SERVICE_NAME"
echo "   Arrêter tous les services:  docker-compose down"
echo ""
echo "🧪 Test de l'API:"
echo ""
echo "   # Créer un utilisateur"
echo "   curl -X POST http://$PUBLIC_IP:8080/api/user-auth/register \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"username\":\"admin@test.com\",\"password\":\"admin123\",\"nom\":\"Admin\",\"prenom\":\"Test\",\"profil\":\"ADMIN\",\"nationalite\":\"Sénégalaise\",\"actif\":true}'"
echo ""
echo "   # Se connecter"
echo "   curl -X POST http://$PUBLIC_IP:8080/api/user-auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"username\":\"admin@test.com\",\"password\":\"admin123\"}'"
echo ""
print_warning "Note: Certains services peuvent prendre quelques minutes supplémentaires pour être complètement opérationnels."
echo ""
