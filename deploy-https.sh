#!/bin/bash

# Script de déploiement avec HTTPS pour PVVIH
# Ce script active HTTPS avec certificat auto-signé

set -e

echo "🔒 Configuration HTTPS pour PVVIH"
echo "================================="

# Vérifier que les certificats existent
if [ ! -f "/etc/ssl/certs/nginx-selfsigned.crt" ]; then
    echo "❌ Erreur: Certificat SSL introuvable"
    echo "Créez d'abord les certificats avec:"
    echo "  sudo mkdir -p /etc/ssl/private"
    echo "  sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
    echo "    -keyout /etc/ssl/private/nginx-selfsigned.key \\"
    echo "    -out /etc/ssl/certs/nginx-selfsigned.crt \\"
    echo "    -subj '/C=SN/ST=Ziguinchor/L=Ziguinchor/O=PVVIH/CN=100.48.20.109'"
    exit 1
fi

echo "✅ Certificats SSL trouvés"

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Reconstruire avec la nouvelle configuration
echo "🔨 Reconstruction des conteneurs..."
docker-compose up -d --build

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "🌐 Accès HTTPS:"
echo "  - https://100.48.20.109        → a_reference_front"
echo "  - https://100.48.20.109/user   → a_user_front"
echo "  - https://100.48.20.109/forum  → gestion_forum_front"
echo "  - https://100.48.20.109/api    → API Gateway"
echo ""
echo "⚠️  Note: Le navigateur affichera un avertissement de sécurité"
echo "    car le certificat est auto-signé. Cliquez sur 'Accepter le risque'."
echo ""
echo "✅ GPS fonctionnera maintenant en HTTPS !"
