#!/bin/bash

# ============================================================================
# SCRIPT D'INSTALLATION ULTRA-RAPIDE - NOUVELLE INSTANCE GCP
# ============================================================================
# Usage: curl -fsSL https://raw.githubusercontent.com/votre-repo/main/quick-setup.sh | bash
# Ou: bash quick-setup.sh
# ============================================================================

echo "🚀 Installation automatique - Instance GCP"
echo "=========================================="
echo ""

# Mise à jour système
echo "📦 Mise à jour du système..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

# Installation Git
echo "📥 Installation de Git..."
sudo apt-get install -y git curl wget

# Installation Docker
echo "🐳 Installation de Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Vérification
echo ""
echo "✅ Installation terminée!"
echo ""
echo "Versions installées:"
git --version
docker --version
docker compose version
echo ""
echo "⚠️  IMPORTANT: Vous devez vous déconnecter et reconnecter!"
echo ""
echo "Après reconnexion, exécutez:"
echo "  git clone https://github.com/bndao20170761-svg/deploiement_v2-crossborder.git"
echo "  cd deploiement_v2-crossborder"
echo "  cp .env.example .env"
echo "  nano .env  # Modifiez avec votre IP"
echo "  docker compose up -d"
echo ""
