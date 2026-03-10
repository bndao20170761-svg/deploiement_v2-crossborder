#!/bin/bash

# ==================== Script de Configuration Nouvelle Instance GCP ====================
# Ce script configure automatiquement votre nouvelle instance GCP
# Usage: bash setup-nouvelle-instance-gcp.sh VOTRE_IP_PUBLIQUE

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
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

# Vérifier l'IP fournie
if [ -z "$1" ]; then
    print_error "Veuillez fournir l'IP publique de votre instance GCP"
    echo "Usage: bash setup-nouvelle-instance-gcp.sh VOTRE_IP_PUBLIQUE"
    echo "Exemple: bash setup-nouvelle-instance-gcp.sh 34.32.116.206"
    exit 1
fi

PUBLIC_IP=$1

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Configuration Nouvelle Instance GCP                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "IP Publique: $PUBLIC_IP"
echo ""

# ==================== ÉTAPE 1: Installation de Docker ====================
print_step "ÉTAPE 1: Installation de Docker"

print_step "Nettoyage des processus apt/dpkg..."
sudo killall -9 apt apt-get dpkg 2>/dev/null || true
sleep 5

print_step "Nettoyage des fichiers de lock..."
sudo rm -f /var/lib/apt/lists/lock
sudo rm -f /var/lib/dpkg/lock*
sudo rm -f /var/cache/apt/archives/lock

print_step "Reconfiguration de dpkg..."
sudo dpkg --configure -a

print_step "Mise à jour des paquets..."
sudo apt update

print_step "Installation de Docker..."
sudo apt install -y docker.io docker-compose git

print_step "Démarrage de Docker..."
sudo systemctl start docker
sudo systemctl enable docker

print_step "Configuration des permissions Docker..."
sudo usermod -aG docker $USER

print_success "Docker installé avec succès!"
docker --version
docker-compose --version

# ==================== ÉTAPE 2: Clonage du Repository ====================
print_step "ÉTAPE 2: Clonage du repository"

if [ -d "deploiement_v2-crossborder" ]; then
    print_warning "Le répertoire existe déjà. Mise à jour..."
    cd deploiement_v2-crossborder
    git pull
else
    print_step "Clonage du repository..."
    git clone https://github.com/VOTRE_USERNAME/deploiement_v2-crossborder.git
    cd deploiement_v2-crossborder
fi

print_success "Repository prêt!"

# ==================== ÉTAPE 3: Configuration de l'environnement ====================
print_step "ÉTAPE 3: Configuration de l'environnement"

print_step "Création du fichier .env avec l'IP $PUBLIC_IP..."

cat > .env << EOF
# ==================== Google Cloud Platform Production Configuration ====================
# Généré automatiquement le $(date)

# ==================== Spring Profile ====================
SPRING_PROFILES_ACTIVE=prod

# ==================== GCP Public URLs ====================
PUBLIC_IP=$PUBLIC_IP

# URLs publiques pour les frontends
PUBLIC_URL=http://$PUBLIC_IP:8080
FORUM_URL=http://$PUBLIC_IP:3001
FRONTEND1_URL=http://$PUBLIC_IP:3002
FRONTEND2_URL=http://$PUBLIC_IP:3003

# ==================== CORS Configuration ====================
CORS_ALLOWED_ORIGINS=http://$PUBLIC_IP:3000,http://$PUBLIC_IP:3001,http://$PUBLIC_IP:3002,http://$PUBLIC_IP:3003,http://$PUBLIC_IP:8080

# ==================== Database Configuration ====================

# MongoDB (Forum Service)
MONGO_PASSWORD=MongoSecure2024!ChangeMe

# MySQL Root Password
MYSQL_ROOT_PASSWORD=RootSecure2024!ChangeMe

# MySQL User Service
MYSQL_USER_PASSWORD=UserSecure2024!ChangeMe

# MySQL Reference Service
MYSQL_REFERENCE_PASSWORD=ReferenceSecure2024!ChangeMe

# MySQL Patient Service
MYSQL_PATIENT_PASSWORD=PatientSecure2024!ChangeMe

# ==================== Security Configuration ====================
JWT_SECRET=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==

# ==================== Logging Configuration ====================
LOG_LEVEL=INFO

# ==================== Service Ports ====================
GATEWAY_PORT=8080
EUREKA_PORT=8761
CONFIG_SERVER_PORT=8888
FORUM_SERVICE_PORT=9092
USER_SERVICE_PORT=9089
REFERENCE_SERVICE_PORT=9090
PATIENT_SERVICE_PORT=9091
FORUM_FRONT_PORT=3001
REFERENCE_FRONT_PORT=3002
USER_FRONT_PORT=3003
MONGODB_PORT=27017
MYSQL_USER_PORT=3307
MYSQL_REFERENCE_PORT=3308
MYSQL_PATIENT_PORT=3309
EOF

print_success "Fichier .env créé!"

# ==================== ÉTAPE 4: Vérification des règles de pare-feu ====================
print_step "ÉTAPE 4: Vérification des règles de pare-feu"

echo ""
print_warning "IMPORTANT: Assurez-vous que ces ports sont ouverts dans GCP:"
echo "  - 8080 (Gateway API)"
echo "  - 8761 (Eureka Dashboard)"
echo "  - 3001 (Frontend Forum)"
echo "  - 3002 (Frontend Reference)"
echo "  - 3003 (Frontend User)"
echo ""
echo "Commande GCP pour créer la règle de pare-feu:"
echo ""
echo "gcloud compute firewall-rules create allow-pvvih-app-ports \\"
echo "  --allow tcp:8080,tcp:8761,tcp:3001,tcp:3002,tcp:3003 \\"
echo "  --source-ranges 0.0.0.0/0 \\"
echo "  --description 'Allow PVVIH application ports'"
echo ""

read -p "Appuyez sur Entrée une fois les règles de pare-feu configurées..."

# ==================== RÉSUMÉ ====================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Configuration Terminée!                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
print_success "Docker installé et configuré"
print_success "Repository cloné"
print_success "Fichier .env créé avec l'IP $PUBLIC_IP"
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. Déconnectez-vous et reconnectez-vous pour activer les permissions Docker:"
echo "   exit"
echo "   # Puis reconnectez-vous via SSH"
echo ""
echo "2. Testez Docker:"
echo "   docker run hello-world"
echo ""
echo "3. Lancez le déploiement:"
echo "   cd deploiement_v2-crossborder"
echo "   bash deploy-gcp-complet.sh"
echo ""
echo "🌐 URLs d'accès (après déploiement):"
echo "   Gateway:    http://$PUBLIC_IP:8080"
echo "   Eureka:     http://$PUBLIC_IP:8761"
echo "   Forum:      http://$PUBLIC_IP:3001"
echo "   Reference:  http://$PUBLIC_IP:3002"
echo "   User:       http://$PUBLIC_IP:3003"
echo ""
