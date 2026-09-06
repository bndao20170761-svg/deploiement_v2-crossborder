#!/bin/bash
# Script COMPLET: Nginx rewrite + PUBLIC_URL + Rebuild

echo "========================================================="
echo "CORRECTION COMPLÈTE - /user/ comme /reference/"
echo "========================================================="
echo ""

cd ~/deploiement_v2-crossborder || exit 1

echo "ÉTAPE 1: Backup des fichiers"
echo "-----------------------------"
cp nginx-https.conf nginx-https.conf.backup.$(date +%Y%m%d_%H%M%S)
cp a_user_front/Dockerfile a_user_front/Dockerfile.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backups créés"
echo ""

echo "ÉTAPE 2: Modification nginx-https.conf (rewrite)"
echo "--------------------------------------------------"

# Supprimer l'ancien bloc location /user/
sed -i '/# a_user_front - Interface utilisateur/,/^    }$/d' nginx-https.conf
sed -i '/# Redirection \/user vers \/user\//,/^    }$/d' nginx-https.conf

# Trouver la ligne avant gestion_forum_front pour insérer le nouveau bloc
LINE_NUM=$(grep -n "# gestion_forum_front - Forum" nginx-https.conf | head -1 | cut -d: -f1)

if [ -z "$LINE_NUM" ]; then
    echo "❌ Impossible de trouver la position d'insertion"
    exit 1
fi

# Insérer le nouveau bloc location /user
INSERT_LINE=$((LINE_NUM - 1))

sed -i "${INSERT_LINE}a\\
\\
    # a_user_front - Interface utilisateur\\
    # IMPORTANT: Utilise rewrite comme pour a-reference-front sur /\\
    location /user {\\
        # Rewrite pour enlever le préfixe /user avant de proxy\\
        rewrite ^/user/(.*)$ /\$1 break;\\
        rewrite ^/user$ / break;\\
        \\
        proxy_pass http://a-user-front:80;\\
        proxy_set_header Host \$host;\\
        proxy_set_header X-Real-IP \$remote_addr;\\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\\
        proxy_set_header X-Forwarded-Proto \$scheme;\\
        proxy_set_header X-Forwarded-Host \$host;\\
        proxy_set_header X-Forwarded-Port \$server_port;\\
        \\
        proxy_http_version 1.1;\\
        proxy_set_header Upgrade \$http_upgrade;\\
        proxy_set_header Connection \"upgrade\";\\
    }
" nginx-https.conf

echo "✅ nginx-https.conf modifié avec rewrite"
echo ""

echo "ÉTAPE 3: Ajout PUBLIC_URL=/user au Dockerfile"
echo "-----------------------------------------------"

if grep -q "ENV PUBLIC_URL=/user" a_user_front/Dockerfile; then
    echo "✅ PUBLIC_URL déjà présent"
else
    # Trouver la ligne avec REACT_APP_FRONTEND2_URL et ajouter PUBLIC_URL après
    sed -i '/ENV REACT_APP_FRONTEND2_URL/a\\
\\
# IMPORTANT: Configure React to use /user/ as base path\
ENV PUBLIC_URL=/user' a_user_front/Dockerfile
    
    echo "✅ PUBLIC_URL=/user ajouté au Dockerfile"
fi
echo ""

echo "ÉTAPE 4: Test configuration nginx"
echo "-----------------------------------"
docker exec nginx-https nginx -t 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Configuration nginx invalide - restauration"
    mv nginx-https.conf.backup.* nginx-https.conf
    exit 1
fi
echo "✅ Configuration nginx valide"
echo ""

echo "ÉTAPE 5: Rebuild a-user-front avec PUBLIC_URL"
echo "-----------------------------------------------"
echo "⏳ Cela peut prendre 5-10 minutes..."
docker compose build --no-cache a-user-front

if [ $? -ne 0 ]; then
    echo "❌ Build échoué"
    exit 1
fi
echo "✅ Build réussi"
echo ""

echo "ÉTAPE 6: Redémarrage des services"
echo "-----------------------------------"
docker compose stop a-user-front nginx-https
docker compose rm -f a-user-front nginx-https
docker compose up -d a-user-front nginx-https

echo "✅ Services redémarrés"
echo ""

echo "ÉTAPE 7: Attente du démarrage (30 secondes)"
echo "--------------------------------------------"
sleep 30

echo ""
echo "ÉTAPE 8: Vérification PUBLIC_URL appliqué"
echo "------------------------------------------"
echo "Vérification des chemins dans index.html:"
docker exec a-user-front cat /usr/share/nginx/html/index.html | grep -o 'src="[^"]*"' | head -3

echo ""
EXPECTED_PATH="/user/static/"
ACTUAL_PATH=$(docker exec a-user-front cat /usr/share/nginx/html/index.html | grep -o 'src="/[^"]*"' | head -1)

if echo "$ACTUAL_PATH" | grep -q "$EXPECTED_PATH"; then
    echo "✅ PUBLIC_URL correctement appliqué !"
    echo "    Les chemins contiennent bien /user/static/..."
else
    echo "⚠️ PUBLIC_URL peut-être pas appliqué"
    echo "    Chemins trouvés: $ACTUAL_PATH"
    echo "    Attendu: src=\"/user/static/...\""
fi

echo ""
echo "ÉTAPE 9: Tests de connectivité"
echo "--------------------------------"
echo ""

echo "Test 1: Port 443 path /user/"
HTTP_CODE=$(curl -k -o /dev/null -s -w "%{http_code}" https://localhost/user/)
echo "  Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ /user/ accessible"
else
    echo "  ⚠️ Code HTTP $HTTP_CODE"
fi

echo ""
echo "Test 2: Port 3003 direct"
HTTP_CODE=$(curl -k -o /dev/null -s -w "%{http_code}" https://localhost:3003/)
echo "  Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ :3003 accessible"
else
    echo "  ⚠️ Code HTTP $HTTP_CODE"
fi

echo ""
echo "Test 3: Fichiers statiques via /user/"
STATIC_FILE=$(docker exec a-user-front ls /usr/share/nginx/html/static/js/*.js 2>/dev/null | head -1 | xargs basename)
if [ -n "$STATIC_FILE" ]; then
    HTTP_CODE=$(curl -k -o /dev/null -s -w "%{http_code}" https://localhost/user/static/js/$STATIC_FILE)
    echo "  Fichier: $STATIC_FILE"
    echo "  Status: $HTTP_CODE"
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✅ Fichiers statiques accessibles via /user/"
    else
        echo "  ⚠️ Code HTTP $HTTP_CODE"
    fi
fi

echo ""
echo "========================================================="
echo "RÉSULTAT FINAL"
echo "========================================================="
echo ""
echo "📋 RÉCAPITULATIF DES MODIFICATIONS"
echo "-----------------------------------"
echo "1. nginx-https.conf:"
echo "   - Ajout location /user avec rewrite"
echo "   - Suppression du trailing slash dans proxy_pass"
echo ""
echo "2. a_user_front/Dockerfile:"
echo "   - Ajout ENV PUBLIC_URL=/user"
echo ""
echo "3. Container a-user-front:"
echo "   - Rebuild avec nouveau Dockerfile"
echo "   - React génère maintenant /user/static/..."
echo ""
echo "🌐 URLs À TESTER"
echo "----------------"
echo "✅ https://100.48.20.109/user/"
echo "   → Interface a-user-front (path-based)"
echo ""
echo "✅ https://100.48.20.109:3003/"
echo "   → Interface a-user-front (port direct)"
echo ""
echo "✅ https://100.48.20.109/"
echo "   → Interface a-reference-front (racine)"
echo ""
echo "========================================================="
echo ""

# Afficher les logs si erreur
if [ "$HTTP_CODE" != "200" ]; then
    echo "⚠️ Erreurs détectées - Logs nginx-https:"
    docker logs nginx-https --tail 20
    echo ""
    echo "Logs a-user-front:"
    docker logs a-user-front --tail 20
fi

echo "🎉 Script terminé !"
echo ""
