#!/bin/bash
# Script pour corriger le conflit du port 3003

echo "=========================================="
echo "CORRECTION: Port 3003 HTTPS"
echo "=========================================="
echo ""

echo "PROBLÈME IDENTIFIÉ:"
echo "  - a-user-front expose le port 3003 (HTTP)"
echo "  - nginx-https veut utiliser le port 3003 (HTTPS)"
echo "  → CONFLIT! Impossible d'avoir les deux"
echo ""

echo "SOLUTION:"
echo "  Changer a-user-front pour utiliser le port 3013"
echo "  Laisser le port 3003 pour nginx-https (HTTPS)"
echo ""

read -p "Appliquer la correction? (o/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo "Annulé"
    exit 1
fi

echo ""
echo "1. Sauvegarde de docker-compose.yml"
cp docker-compose.yml docker-compose.yml.backup-$(date +%Y%m%d-%H%M%S)

echo "2. Modification de docker-compose.yml"
sed -i 's/"3003:80"/"3013:80"/g' docker-compose.yml

echo "3. Vérification"
grep -A 2 "a-user-front" docker-compose.yml | grep ports

echo ""
echo "4. Redémarrage des services"
docker compose stop a-user-front nginx-https
docker compose rm -f a-user-front nginx-https
docker compose up -d a-user-front nginx-https

echo ""
echo "=========================================="
echo "CORRECTION TERMINÉE"
echo "=========================================="
echo ""
echo "URLs maintenant disponibles:"
echo "  ✅ https://100.48.20.109:3001 → a-reference-front (HTTPS via nginx)"
echo "  ✅ https://100.48.20.109:3002 → gestion-forum-front (HTTPS via nginx)"
echo "  ✅ https://100.48.20.109:3003 → a-user-front (HTTPS via nginx)"
echo "  ✅ http://100.48.20.109:3013  → a-user-front (HTTP direct)"
echo ""
echo "Testez: https://100.48.20.109:3003"
