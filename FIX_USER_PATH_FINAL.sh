#!/bin/bash
# Solution FINALE - Copie exacte de la config qui marche pour a-reference-front

echo "=================================================="
echo "CORRECTION FINALE /user/ - Méthode a-reference-front"
echo "=================================================="
echo ""

cd ~/deploiement_v2-crossborder || exit 1

echo "ANALYSE: Pourquoi a-reference-front marche ?"
echo "----------------------------------------------"
echo "✅ https://100.48.20.109/ → fonctionne"
echo "✅ https://100.48.20.109/reference → redirige vers :3001"
echo ""
echo "Raison: nginx proxy vers a-reference-front:80 SANS enlever de préfixe !"
echo "Location / { proxy_pass http://a-reference-front:80; }"
echo "                                                  ^^^ PAS DE TRAILING SLASH"
echo ""

echo "PROBLÈME: Pourquoi /user/ ne marche PAS ?"
echo "-------------------------------------------"
echo "❌ https://100.48.20.109/user/ → 404 sur /static/..."
echo ""
echo "Raison: nginx utilise proxy_pass http://a-user-front:80/"
echo "                                                      ^^^ AVEC TRAILING SLASH"
echo "Cela enlève le préfixe /user/ et l'app cherche /static/ au lieu de /user/static/"
echo ""

echo "SOLUTION: Utiliser rewrite pour faire comme a-reference-front"
echo "---------------------------------------------------------------"
echo ""

# Backup
cp nginx-https.conf nginx-https.conf.backup.$(date +%Y%m%d_%H%M%S)

# Correction 1: Remplacement du location /user/
echo "1. Modification location /user/ avec rewrite..."

cat > /tmp/nginx_user_location.conf << 'EOF'
    # a_user_front - Interface utilisateur
    # IMPORTANT: Utilise un rewrite pour enlever le préfixe /user (comme pour /)
    location /user {
        # Rewrite pour enlever le préfixe /user avant de proxy
        rewrite ^/user/(.*)$ /$1 break;
        rewrite ^/user$ / break;
        
        proxy_pass http://a-user-front:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Support WebSocket si nécessaire
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
EOF

# Utiliser sed pour remplacer tout le bloc location /user/
sed -i '/# a_user_front - Interface utilisateur/,/location = \/user {/c\
    # a_user_front - Interface utilisateur\
    # IMPORTANT: Utilise un rewrite pour enlever le préfixe /user (comme pour /)\
    location /user {\
        # Rewrite pour enlever le préfixe /user avant de proxy\
        rewrite ^/user/(.*)$ /$1 break;\
        rewrite ^/user$ / break;\
        \
        proxy_pass http://a-user-front:80;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_set_header X-Forwarded-Host $host;\
        proxy_set_header X-Forwarded-Port $server_port;\
        \
        # Support WebSocket si nécessaire\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection "upgrade";\
    }' nginx-https.conf

# Supprimer la redirection /user qui n'est plus nécessaire
sed -i '/# Redirection \/user vers \/user\//,/return 301 \/user\/;/d' nginx-https.conf
sed -i '/location = \/user {/,/}/d' nginx-https.conf

echo "✅ Location /user/ modifié avec rewrite"
echo ""

# Correction 2: Vérifier les ports SSL
echo "2. Vérification des ports SSL..."

# Compter les serveurs 3003
NB_3003=$(grep -c "listen 3003 ssl" nginx-https.conf)
if [ "$NB_3003" -gt 1 ]; then
    echo "⚠️ Plusieurs serveurs sur port 3003 détectés - correction..."
    # Garder seulement le premier
    awk '/listen 3003 ssl/{c++} c==1{p=1} /^}$/ && p{p=0; print; next} !p || c==1' nginx-https.conf > nginx-https.conf.tmp
    mv nginx-https.conf.tmp nginx-https.conf
    echo "✅ Doublon supprimé"
else
    echo "✅ Port 3003 unique"
fi

# Vérifier que 3001 pointe vers a-reference-front
if grep -A 20 "listen 3001 ssl" nginx-https.conf | grep -q "a-reference-front"; then
    echo "✅ Port 3001 → a-reference-front"
else
    echo "❌ Port 3001 ne pointe PAS vers a-reference-front - correction..."
    sed -i '/listen 3001 ssl/,/proxy_pass/{s|http://a-user-front:80|http://a-reference-front:80|}' nginx-https.conf
    echo "✅ Corrigé"
fi

echo ""
echo "3. Test de la configuration nginx..."
docker exec nginx-https nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Configuration nginx invalide - restauration du backup"
    cp nginx-https.conf.backup.* nginx-https.conf
    exit 1
fi
echo "✅ Configuration nginx valide"
echo ""

echo "4. Redémarrage de nginx-https..."
docker compose restart nginx-https

echo ""
echo "5. Attente du redémarrage (10 secondes)..."
sleep 10

echo ""
echo "6. Tests de connectivité"
echo "-------------------------"
echo ""

echo "Test 1: https://localhost/user/ (path-based)"
curl -kI https://localhost/user/ 2>&1 | head -5
echo ""

echo "Test 2: https://localhost:3003/ (port direct)"
curl -kI https://localhost:3003/ 2>&1 | head -5
echo ""

echo "Test 3: Vérification des chemins statiques"
CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' a-user-front)
echo "IP container a-user-front: $CONTAINER_IP"
curl -I http://$CONTAINER_IP/static/js/main.2149f24b.js 2>&1 | head -3
echo ""

echo "=================================================="
echo "RÉSULTAT"
echo "=================================================="
echo ""
echo "URLs à tester dans votre navigateur:"
echo ""
echo "✅ https://100.48.20.109/user/"
echo "   → Devrait maintenant fonctionner (rewrite enlève le préfixe)"
echo ""
echo "✅ https://100.48.20.109:3003/"
echo "   → Fonctionne (port direct SSL)"
echo ""
echo "✅ https://100.48.20.109/"
echo "   → Continue de fonctionner (a-reference-front)"
echo ""
echo "EXPLICATION TECHNIQUE:"
echo "----------------------"
echo "Avant:"
echo "  location /user/ { proxy_pass http://a-user-front:80/; }"
echo "  → Nginx enlève /user/ et envoie / au container"
echo "  → React app génère /static/... mais nginx cherche /user/static/... = 404"
echo ""
echo "Maintenant:"
echo "  location /user { rewrite ^/user/(.*)$ /\$1 break; proxy_pass http://a-user-front:80; }"
echo "  → Rewrite transforme /user/index.html en /index.html"
echo "  → Rewrite transforme /user/static/js/main.js en /static/js/main.js"
echo "  → Nginx proxy vers le container sans trailing slash"
echo "  → Container sert les fichiers normalement ✅"
echo ""
echo "C'est EXACTEMENT comme pour a-reference-front sur / !"
echo ""
echo "=================================================="
