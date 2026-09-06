#!/bin/bash
# Script de correction COMPLÈTE pour nginx-https sur le serveur GCP
# À exécuter directement sur le serveur : bash CORRIGER_NGINX_HTTPS_SUR_SERVEUR.sh

set -e

echo "=========================================="
echo "🔧 CORRECTION NGINX-HTTPS"
echo "=========================================="
echo ""

# Vérifier qu'on est sur le serveur
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERREUR: docker-compose.yml introuvable"
    echo "   Exécutez ce script depuis ~/deploiement_v2-crossborder/"
    exit 1
fi

echo "1. Backup de la configuration actuelle"
echo "----------------------------------------"
if [ -f "nginx-https.conf" ]; then
    cp nginx-https.conf nginx-https.conf.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup créé"
else
    echo "⚠️  Pas de nginx-https.conf trouvé"
fi
echo ""

echo "2. Création de la nouvelle configuration nginx-https.conf"
echo "----------------------------------------"
cat > nginx-https.conf << 'NGINX_EOF'
# Configuration Nginx avec HTTPS pour PVVIH
# Ce fichier configure un proxy inverse avec SSL

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# Configuration HTTPS PRINCIPALE (port 443)
server {
    listen 443 ssl;
    server_name _;

    # Certificats SSL
    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Configuration pour fichiers volumineux
    client_max_body_size 100M;
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;

    # Route par défaut - a_reference_front
    location / {
        proxy_pass http://a-reference-front:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Port 3001 - a-reference-front
server {
    listen 3001 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://a-reference-front:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Port 3002 - gestion-forum-front
server {
    listen 3002 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://gestion-forum-front:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Port 3003 - a-user-front
server {
    listen 3003 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
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

# Port 8080 - API Gateway (CRITIQUE POUR LES APPELS API!)
server {
    listen 8080 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Configuration pour API
    client_max_body_size 100M;
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;

    # Router TOUT vers le Gateway
    location / {
        proxy_pass http://gateway-pvvih:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Support WebSocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX_EOF

echo "✅ Nouvelle configuration créée"
echo ""

echo "3. Validation de la syntaxe nginx"
echo "----------------------------------------"
if docker run --rm -v $(pwd)/nginx-https.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Syntaxe nginx valide"
else
    echo "❌ ERREUR: Syntaxe nginx invalide"
    docker run --rm -v $(pwd)/nginx-https.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine nginx -t
    exit 1
fi
echo ""

echo "4. Redémarrage de nginx-https"
echo "----------------------------------------"
docker compose restart nginx-https
echo "✅ nginx-https redémarré"
echo ""

echo "5. Attendre que nginx-https soit healthy"
echo "----------------------------------------"
sleep 5
for i in {1..30}; do
    if docker ps | grep nginx-https | grep -q "healthy"; then
        echo "✅ nginx-https est healthy"
        break
    fi
    echo "   Attente... ($i/30)"
    sleep 2
done
echo ""

echo "6. Tests de connectivité"
echo "----------------------------------------"
echo "Test port 443:"
timeout 3 curl -k -I https://localhost:443/ 2>&1 | head -2

echo ""
echo "Test port 3001 (a-reference-front):"
timeout 3 curl -k -I https://localhost:3001/ 2>&1 | head -2

echo ""
echo "Test port 3003 (a-user-front):"
timeout 3 curl -k -I https://localhost:3003/ 2>&1 | head -2

echo ""
echo "Test port 8080 (Gateway - CRITIQUE):"
timeout 3 curl -k -I https://localhost:8080/actuator/health 2>&1 | head -5

echo ""
echo "=========================================="
echo "📋 RÉSUMÉ"
echo "=========================================="
echo ""
echo "✅ Configuration nginx-https corrigée"
echo "✅ Tous les ports SSL configurés:"
echo "   - 443  : HTTPS principal (a-reference-front par défaut)"
echo "   - 3001 : a-reference-front"
echo "   - 3002 : gestion-forum-front"
echo "   - 3003 : a-user-front"
echo "   - 8080 : API Gateway (pour les appels API)"
echo ""
echo "📍 URLs à tester depuis votre navigateur:"
echo "   https://100.48.20.109:3001"
echo "   https://100.48.20.109:3003"
echo "   https://100.48.20.109:8080/actuator/health"
echo ""
echo "🔍 Vérifier les logs en cas de problème:"
echo "   docker logs nginx-https --tail 50"
echo ""
