#!/bin/bash
# Script de correction finale pour activer /user/ avec PUBLIC_URL

echo "=========================================="
echo "CORRECTION FINALE - Path-based routing"
echo "=========================================="
echo ""

cd ~/deploiement_v2-crossborder || exit 1

echo "ÉTAPE 1: Ajout du port 3003 SSL dans nginx-https.conf"
echo "------------------------------------------------------"

# Vérifier si le port 3003 SSL existe déjà
if grep -q "listen 3003 ssl" nginx-https.conf; then
    echo "✅ Port 3003 SSL déjà configuré"
else
    echo "❌ Port 3003 SSL manquant - Ajout..."
    
    # Ajouter le serveur pour port 3003
    cat >> nginx-https.conf << 'EOF'

# Serveur séparé pour a-user-front sur port 3003
server {
    listen 3003 ssl;
    server_name _;

    # Certificats SSL
    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    
    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://a-user-front:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    echo "✅ Configuration ajoutée"
fi

echo ""
echo "ÉTAPE 2: Modification du Dockerfile a_user_front avec PUBLIC_URL=/user"
echo "-----------------------------------------------------------------------"

# Backup du Dockerfile
cp a_user_front/Dockerfile a_user_front/Dockerfile.backup.$(date +%Y%m%d_%H%M%S)

# Vérifier si PUBLIC_URL existe déjà
if grep -q "ENV PUBLIC_URL=/user" a_user_front/Dockerfile; then
    echo "✅ PUBLIC_URL déjà configuré"
else
    echo "❌ PUBLIC_URL manquant - Ajout..."
    
    # Ajouter PUBLIC_URL après les autres ENV
    sed -i '/ENV REACT_APP_FRONTEND2_URL/a\
\
# IMPORTANT: Configure React to use /user/ as base path\
ENV PUBLIC_URL=/user' a_user_front/Dockerfile
    
    echo "✅ PUBLIC_URL=/user ajouté au Dockerfile"
fi

echo ""
echo "ÉTAPE 3: Modification nginx-https.conf location /user/"
echo "--------------------------------------------------------"

# Corriger le proxy_pass pour /user/ (enlever le trailing slash)
if grep -A 2 'location /user/' nginx-https.conf | grep -q 'proxy_pass http://a-user-front:80/'; then
    echo "❌ Trailing slash détecté - Correction..."
    sed -i 's|proxy_pass http://a-user-front:80/;|proxy_pass http://a-user-front:80;|g' nginx-https.conf
    echo "✅ Trailing slash enlevé"
else
    echo "✅ Configuration proxy_pass correcte"
fi

echo ""
echo "ÉTAPE 4: Rebuild a-user-front avec PUBLIC_URL"
echo "----------------------------------------------"
docker compose build --no-cache a-user-front

echo ""
echo "ÉTAPE 5: Redémarrage des services"
echo "-----------------------------------"
docker compose stop a-user-front nginx-https
docker compose rm -f a-user-front nginx-https
docker compose up -d a-user-front nginx-https

echo ""
echo "ÉTAPE 6: Attente du démarrage (30 secondes)..."
echo "-----------------------------------------------"
sleep 30

echo ""
echo "ÉTAPE 7: Tests de connectivité"
echo "--------------------------------"
echo ""
echo "Test 1: Port 3003 SSL (direct)"
timeout 3 openssl s_client -connect localhost:3003 </dev/null 2>&1 | grep -E "(CONNECTED|Verify return code)" || echo "❌ Port 3003 SSL ne répond pas"

echo ""
echo "Test 2: Path /user/ via port 443"
curl -kI https://localhost/user/ 2>&1 | head -3

echo ""
echo "Test 3: Container a-user-front direct"
CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' a-user-front)
echo "IP du container: $CONTAINER_IP"
curl -I http://$CONTAINER_IP/ 2>&1 | head -3

echo ""
echo "=========================================="
echo "RÉSULTAT FINAL"
echo "=========================================="
echo ""
echo "URLs à tester depuis votre navigateur:"
echo ""
echo "✅ https://100.48.20.109:3003/       (port direct SSL)"
echo "✅ https://100.48.20.109/user/       (path-based avec PUBLIC_URL)"
echo ""
echo "Si https://100.48.20.109/user/ affiche toujours des erreurs 404,"
echo "vérifiez dans le HTML source si les chemins sont corrects:"
echo "  - Devrait être: <script src=\"/user/static/js/main.xxx.js\"></script>"
echo "  - Et NON: <script src=\"/static/js/main.xxx.js\"></script>"
echo ""
echo "Pour vérifier:"
echo "  docker exec a-user-front cat /usr/share/nginx/html/index.html | grep static"
echo ""
