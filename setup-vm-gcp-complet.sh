#!/bin/bash

# ==================== Script de Configuration Complète VM GCP ====================
# Ce script configure une nouvelle VM GCP avec:
# - Mise à jour du système
# - Installation de Docker et Docker Compose
# - Installation de Git
# - Configuration des permissions
# Usage: bash setup-vm-gcp-complet.sh

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

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Configuration Complète VM GCP                                ║"
echo "║   Mise à jour + Docker + Git                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ==================== ÉTAPE 1: Nettoyage des Processus ====================
print_step "ÉTAPE 1: Nettoyage des processus apt/dpkg en cours"

print_step "Arrêt des processus apt/dpkg..."
sudo killall -9 apt apt-get dpkg 2>/dev/null || true
sleep 5

print_step "Nettoyage des fichiers de lock..."
sudo rm -f /var/lib/apt/lists/lock
sudo rm -f /var/lib/dpkg/lock*
sudo rm -f /var/cache/apt/archives/lock

print_step "Reconfiguration de dpkg..."
sudo dpkg --configure -a

print_success "Nettoyage terminé!"

# ==================== ÉTAPE 2: Mise à Jour du Système ====================
print_step "ÉTAPE 2: Mise à jour du système"

print_step "Mise à jour de la liste des paquets..."
sudo apt update

print_step "Mise à niveau des paquets installés..."
sudo apt upgrade -y

print_step "Nettoyage des paquets inutiles..."
sudo apt autoremove -y
sudo apt autoclean

print_success "Système mis à jour!"

# ==================== ÉTAPE 3: Installation de Git ====================
print_step "ÉTAPE 3: Installation de Git"

if command -v git &> /dev/null; then
    print_warning "Git est déjà installé ($(git --version))"
else
    print_step "Installation de Git..."
    sudo apt install -y git
    print_success "Git installé: $(git --version)"
fi

# Configuration de base de Git
print_step "Configuration de Git..."
git config --global color.ui auto
git config --global core.editor nano

print_success "Git configuré!"

# ==================== ÉTAPE 4: Installation de Docker ====================
print_step "ÉTAPE 4: Installation de Docker"

if command -v docker &> /dev/null; then
    print_warning "Docker est déjà installé ($(docker --version))"
else
    print_step "Installation de Docker..."
    
    # Installation des dépendances
    sudo apt install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Ajout de la clé GPG officielle de Docker
    print_step "Ajout de la clé GPG Docker..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Ajout du repository Docker
    print_step "Ajout du repository Docker..."
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Mise à jour et installation
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    print_success "Docker installé: $(docker --version)"
fi

# ==================== ÉTAPE 5: Installation de Docker Compose ====================
print_step "ÉTAPE 5: Vérification de Docker Compose"

if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose déjà installé: $(docker-compose --version)"
else
    print_step "Installation de Docker Compose standalone..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installé: $(docker-compose --version)"
fi

# ==================== ÉTAPE 6: Configuration de Docker ====================
print_step "ÉTAPE 6: Configuration de Docker"

print_step "Démarrage du service Docker..."
sudo systemctl start docker
sudo systemctl enable docker

print_step "Ajout de l'utilisateur au groupe docker..."
sudo usermod -aG docker $USER

print_success "Docker configuré!"

# ==================== ÉTAPE 7: Vérifications ====================
print_step "ÉTAPE 7: Vérifications finales"

echo ""
print_step "Versions installées:"
echo "  • Système: $(lsb_release -d | cut -f2)"
echo "  • Git: $(git --version)"
echo "  • Docker: $(docker --version)"
echo "  • Docker Compose: $(docker-compose --version)"

echo ""
print_step "État des services:"
if sudo systemctl is-active --quiet docker; then
    print_success "Docker est actif"
else
    print_error "Docker n'est pas actif"
fi

echo ""
print_step "Espace disque disponible:"
df -h / | tail -1 | awk '{print "  • Utilisé: " $3 " / " $2 " (" $5 ")"}'

echo ""
print_step "Mémoire disponible:"
free -h | grep "Mem:" | awk '{print "  • Utilisée: " $3 " / " $2}'

# ==================== RÉSUMÉ ====================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Configuration Terminée!                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
print_success "Système mis à jour"
print_success "Git installé et configuré"
print_success "Docker installé et configuré"
print_success "Docker Compose installé"
print_success "Permissions configurées"
echo ""
print_warning "IMPORTANT: Vous devez vous déconnecter et reconnecter pour que"
print_warning "les permissions Docker prennent effet!"
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. Déconnectez-vous de la VM:"
echo "   exit"
echo ""
echo "2. Reconnectez-vous via SSH"
echo ""
echo "3. Testez Docker (sans sudo):"
echo "   docker run hello-world"
echo ""
echo "4. Clonez votre repository:"
echo "   git clone https://github.com/VOTRE_USERNAME/deploiement_v2-crossborder.git"
echo "   cd deploiement_v2-crossborder"
echo ""
echo "5. Lancez le déploiement:"
echo "   bash deploy-gcp-complet.sh"
echo ""
