#!/bin/bash
# Script de restauration d'urgence - À exécuter sur le serveur

echo "=========================================="
echo "RESTAURATION CONFIG QUI FONCTIONNAIT"
echo "=========================================="
echo ""

# Sauvegarder la config actuelle (cassée)
echo "1. Sauvegarde de la config cassée..."
docker exec nginx-https cat /etc/nginx/conf.d/default.conf > ~/nginx-https-CASSE-$(date +%Y%m%d-%H%M%S).conf
echo "   ✅ Sauvegardé dans ~/nginx-https-CASSE-*.conf"
echo ""

# Restaurer depuis git (version qui fonctionnait)
echo "2. Restauration depuis Git..."
cd ~/deploiement_v2-crossborder
git checkout nginx-https.conf
echo "   ✅ Fichier nginx-https.conf restauré depuis Git"
echo ""

# Redémarrer nginx-https
echo "3. Redémarrage de nginx-https..."
docker compose restart nginx-https
sleep 3
echo ""

# Vérifier l'état
echo "4. Vérification..."
docker ps | grep nginx-https
echo ""

# Test rapide
echo "5. Test rapide des ports..."
timeout 2 curl -k -I https://localhost:3001 2>&1 | head -1
timeout 2 curl -k -I https://localhost:3002 2>&1 | head -1
timeout 2 curl -k -I https://localhost:3003 2>&1 | head -1
echo ""

echo "=========================================="
echo "RESTAURATION TERMINÉE"
echo "=========================================="
echo "Testez maintenant depuis votre navigateur:"
echo "  https://100.48.20.109:3001"
echo "  https://100.48.20.109:3002"
echo "  https://100.48.20.109:3003"
