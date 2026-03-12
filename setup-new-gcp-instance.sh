#!/bin/bash

# ============================================================================
# SCRIPT DE CONFIGURATION COMPLÈTE - NOUVELLE INSTANCE GCP
# ============================================================================
# Ce script installe et configure tout ce qui est nécessaire sur une nouvelle
# instance GCP Ubuntu/Debian
# ============================================================================

set -e

echo "============================================================================"
echo "CONFIGURATION NOUVELLE INSTANCE GCP"
echo "============================================================================"
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[ÉTAPE]${NC} $1"
}

# ============================================================================
# ÉTAPE 1: MISE À JOUR DU SYSTÈME
# ============================================================================
log_step "1/7: Mise à jour du système..."
sudo apt-get update
sudo apt-get upgrade -y

# ============================================================================
# ÉTAPE 2: INSTALLATION DES OUTILS DE BASE
# ============================================================================
log_step "2/7: Installation des outils de base..."
sudo apt-get install -y \
    curl \
    wget \
    vim \
    nano \
    htop \
    net-tools \
    ca-certificates \
    gnupg \
    lsb-release

# ============================================================================
# ÉTAPE 3: INSTALLATION DE GIT
# ============================================================================
log_step "3/7: Installation de Git..."
sudo apt-get install -y git

# Vérifier l'installation
git --version
log_info "Git installé avec succès!"

# Configuration de Git (optionnel)
read -p "Voulez-vous configurer Git maintenant? (o/n): " configure_git
if [ "$configure_git" = "o" ] || [ "$configure_git" = "O" ]; then
    read -p "Entrez votre nom: " git_name
    read -p "Entrez votre email: " git_email
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    log_info "Git configuré!"
fi

# ============================================================================
# ÉTAPE 4: INSTALLATION DE DOCKER
# ============================================================================
log_step "4/7: Installation de Docker..."

# Supprimer les anciennes versions si elles existent
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Ajouter le dépôt Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Vérifier l'installation
docker --version
log_info "Docker installé avec succès!"

# ============================================================================
# ÉTAPE 5: INSTALLATION DE DOCKER COMPOSE
# ============================================================================
log_step "5/7: Installation de Docker Compose..."

# Docker Compose v2 est déjà installé avec docker-compose-plugin
# Créer un alias pour docker-compose
echo 'alias docker-compose="docker compose"' >> ~/.bashrc

docker compose version
log_info "Docker Compose installé avec succès!"

# ============================================================================
# ÉTAPE 6: CONFIGURATION DU PARE-FEU
# ============================================================================
log_step "6/7: Configuration du pare-feu..."

log_info "Ports à ouvrir dans GCP Console:"
echo "  - 8761 (Eureka)"
echo "  - 8888 (Config Server)"
echo "  - 8080 (Gateway)"
echo "  - 3001 (Forum Frontend)"
echo "  - 3002 (Reference Frontend)"
echo "  - 3003 (User Frontend)"
echo "  - 9089-9092 (Backend Services)"
echo ""
log_warn "N'oubliez pas d'ouvrir ces ports dans la console GCP!"
log_warn "VPC Network > Firewall > Create Firewall Rule"

# ============================================================================
# ÉTAPE 7: CLONAGE DU PROJET
# ============================================================================
log_step "7/7: Clonage du projet..."

read -p "Voulez-vous cloner le projet maintenant? (o/n): " clone_project
if [ "$clone_project" = "o" ] || [ "$clone_project" = "O" ]; then
    read -p "Entrez l'URL du dépôt Git: " repo_url
    
    if [ -z "$repo_url" ]; then
        repo_url="https://github.com/bndao20170761-svg/deploiement_v2-crossborder.git"
        log_info "Utilisation du dépôt par défaut: $repo_url"
    fi
    
    # Supprimer le dossier s'il existe déjà
    if [ -d "deploiement_v2-crossborder" ]; then
        log_warn "Le dossier existe déjà, suppression..."
        rm -rf deploiement_v2-crossborder
    fi
    
    git clone $repo_url
    cd deploiement_v2-crossborder
    
    log_info "Projet cloné avec succès!"
    
    # Créer le fichier .env
    if [ -f ".env.example" ]; then
        log_info "Création du fichier .env..."
        cp .env.example .env
        
        # Obtenir l'IP externe de l'instance
        EXTERNAL_IP=$(curl -s ifconfig.me)
        log_info "IP externe détectée: $EXTERNAL_IP"
        
        # Remplacer l'IP dans le fichier .env
        sed -i "s/34\.28\.161\.231/$EXTERNAL_IP/g" .env
        
        log_info "Fichier .env créé et configuré avec votre IP!"
        log_warn "Vérifiez et modifiez le fichier .env si nécessaire:"
        log_warn "  nano .env"
    fi
fi

# ============================================================================
# RÉSUMÉ ET PROCHAINES ÉTAPES
# ============================================================================
echo ""
log_info "============================================================================"
log_info "INSTALLATION TERMINÉE!"
log_info "============================================================================"
echo ""
log_warn "IMPORTANT: Vous devez vous déconnecter et reconnecter pour que Docker fonctionne!"
log_warn "Commande: exit (puis reconnectez-vous)"
echo ""
log_info "Après reconnexion, suivez ces étapes:"
echo ""
echo "1. Allez dans le dossier du projet:"
echo "   cd deploiement_v2-crossborder"
echo ""
echo "2. Vérifiez le fichier .env:"
echo "   nano .env"
echo ""
echo "3. Lancez le déploiement:"
echo "   chmod +x clean-rebuild-all.sh"
echo "   ./clean-rebuild-all.sh"
echo ""
echo "4. Ou utilisez docker-compose directement:"
echo "   docker compose build"
echo "   docker compose up -d"
echo ""
log_info "Pour vérifier l'état des services:"
echo "   docker compose ps"
echo "   docker compose logs -f"
echo ""
log_info "============================================================================"
