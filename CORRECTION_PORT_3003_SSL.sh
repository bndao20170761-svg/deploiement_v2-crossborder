#!/bin/bash
# Script de correction pour ajouter le support SSL au port 3003

echo "=========================================="
echo "CORRECTION PORT 3003 - Ajout SSL"
echo "=========================================="
echo ""

echo "Étape 1: Copie du fichier nginx-https.conf corrigé"
echo "---------------------------------------------------"
# Le fichier nginx-https.conf a été modifié localement
# Vous devez le copier sur le serveur avec scp ou git pull

echo "Étape 2: Vérification de la configuration nginx"
echo "------------------------------------------------"
docker exec nginx-https nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration nginx valide"
else
    echo "❌ Erreur de configuration nginx"
    exit 1
fi

echo ""
echo "Étape 3: Redémarrage du conteneur nginx-https"
echo "----------------------------------------------"
docker compose restart nginx-https

echo ""
echo "Attente du démarrage (5 secondes)..."
sleep 5

echo ""
echo "Étape 4: Vérification du statut"
echo "--------------------------------"
docker ps | grep nginx-https

echo ""
echo "Étape 5: Test du port 3003 SSL"
echo "-------------------------------"
timeout 3 openssl s_client -connect localhost:3003 -servername 100.48.20.109 </dev/null 2>&1 | grep -E "(CONNECTED|Verify return code)"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Port 3003 SSL fonctionne correctement !"
else
    echo ""
    echo "❌ Le port 3003 SSL ne répond pas encore"
fi

echo ""
echo "Étape 6: Vérification des logs"
echo "-------------------------------"
docker logs nginx-https --tail 20

echo ""
echo "=========================================="
echo "CORRECTION TERMINÉE"
echo "=========================================="
echo ""
echo "Testez maintenant :"
echo "  https://100.48.20.109:3003"
echo ""
