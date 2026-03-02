#!/bin/bash

# Script d'installation automatique pour AWS EC2 Ubuntu
# Usage: bash setup-aws-ec2.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Installation des dépendances pour déploiement AWS EC2"
echo "=========================================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier si on est sur Ubuntu
if [ ! -f /etc/lsb-release ]; then
    log_error "Ce script est conçu pour Ubuntu"
    exit 1
fi

log_info "Système détecté: $(lsb_release -d | cut -f2)"
echo ""

# 1. Mise à jour du système
log_info "Étape 1/6: Mise à jour du système..."
sudo apt update -qq
sudo apt upgrade -y -qq
log_info "Système mis à jour"
echo ""

# 2. Installation de Docker
log_info "Étape 2/6: Installation de Docker..."

if command -v docker &> /dev/null; then
    log_warn "Docker est déjà installé ($(docker --version))"
else
    # Installer les dépendances
    sudo apt install -y -qq apt-transport-https ca-certificates curl software-properties-common

    # Ajouter la clé GPG Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Ajouter le repository Docker
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Installer Docker
    sudo apt update -qq
    sudo apt install -y -qq docker-ce docker-ce-cli containerd.io

    # Ajouter l'utilisateur au groupe docker
    sudo usermod -aG docker $USER

    log_info "Docker installé: $(docker --version)"
fi
echo ""

# 3. Installation de Docker Compose
log_info "Étape 3/6: Installation de Docker Compose..."

if command -v docker-compose &> /dev/null; then
    log_warn "Docker Compose est déjà installé ($(docker-compose --version))"
else
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_info "Docker Compose installé: $(docker-compose --version)"
fi
echo ""

# 4. Installation de Git
log_info "Étape 4/6: Installation de Git..."

if command -v git &> /dev/null; then
    log_warn "Git est déjà installé ($(git --version))"
else
    sudo apt install -y -qq git
    log_info "Git installé: $(git --version)"
fi
echo ""

# 5. Installation d'outils utiles
log_info "Étape 5/6: Installation d'outils utiles..."
sudo apt install -y -qq curl wget nano htop net-tools
log_info "Outils installés"
echo ""

# 6. Configuration du pare-feu (optionnel)
log_info "Étape 6/6: Configuration du pare-feu..."

if command -v ufw &> /dev/null; then
    log_warn "UFW est déjà installé"
else
    sudo apt install -y -qq ufw
fi

# Ne pas activer automatiquement pour éviter de bloquer SSH
log_warn "UFW installé mais pas activé (pour éviter de bloquer SSH)"
log_warn "Pour l'activer manuellement:"
echo "  sudo ufw allow 22/tcp"
echo "  sudo ufw allow 8080/tcp"
echo "  sudo ufw allow 3001:3003/tcp"
echo "  sudo ufw enable"
echo ""

# Récupérer l'IP publique
log_info "Récupération de l'IP publique..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s ifconfig.me)
log_info "IP publique: $PUBLIC_IP"
echo ""

# Afficher le résumé
echo "=========================================================="
echo -e "${GREEN}✓ Installation terminée avec succès!${NC}"
echo "=========================================================="
echo ""
echo "📋 Résumé:"
echo "  • Docker: $(docker --version)"
echo "  • Docker Compose: $(docker-compose --version)"
echo "  • Git: $(git --version)"
echo "  • IP publique: $PUBLIC_IP"
echo ""
echo "🔄 IMPORTANT: Reconnectez-vous pour appliquer les changements Docker"
echo "   Commande: exit puis reconnectez-vous en SSH"
echo ""
echo "📝 Prochaines étapes:"
echo "  1. Reconnectez-vous en SSH"
echo "  2. Clonez votre repository: git clone https://github.com/VOTRE_REPO.git"
echo "  3. Configurez le fichier .env"
echo "  4. Lancez: docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "📚 Documentation complète: DEPLOIEMENT_AWS_EC2.md"
echo ""
