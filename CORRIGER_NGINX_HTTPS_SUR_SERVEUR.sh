#!/bin/bash
# Script pour corriger nginx-https.conf sur le serveur GCP
# À exécuter SUR LE SERVEUR GCP

echo "=========================================="
echo "🔧 CORRECTION nginx-https.conf"
echo "=========================================="
echo ""

cd ~/deploiement_v2-crossborder || exit 1

echo "1. Sauvegarde de l'ancienne configuration"
echo "----------------------------------------"
cp nginx-https.conf nginx-https.conf.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Sauvegarde créée"
echo ""

echo "2. Création de la nouvelle configuration"
echo "----------------------------------------"
cat > nginx-https.conf << 'EOFNGINX'
# Configuration Nginx avec HTTPS pour PVVIH
# Ce fichier configure un proxy inverse avec SSL

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# Configuration HTTPS principale (port 443)
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

    # Configuration pour fichiers statiques volumineux
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

# Serveur pour a-reference-front sur port 3001
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

# Serveur pour gestion-forum-front sur port 3002
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

# Serveur pour a-user-front sur port 3003
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

# Serveur pour API Gateway sur port 8080 (CRITIQUE)
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

    # Router vers le Gateway Spring Cloud
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
        
        # Headers CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin' always;
        add_header 'Access-Control-Max-Age' 3600 always;
        
        # Preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin' always;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            return 204;
        }
    }
}
EOFNGINX

echo "✅ Nouvelle configuration créée"
echo ""

echo "3. Vérification de la syntaxe"
echo "----------------------------------------"
docker exec nginx-https nginx -t 2>&1 || echo "⚠️ Le conteneur n'a pas encore rechargé"
echo ""

echo "4. Redémarrage de nginx-https"
echo "----------------------------------------"
docker compose restart nginx-https
echo "✅ nginx-https redémarré"
echo ""

echo "5. Attente du démarrage (10 secondes)..."
sleep 10
echo ""

echo "6. Vérification de la configuration chargée"
echo "----------------------------------------"
docker exec nginx-https nginx -t
echo ""

echo "7. Test des ports"
echo "----------------------------------------"
echo "Port 8080 (Gateway API):"
curl -k -s -o /dev/null -w "%{http_code}" https://localhost:8080/actuator/health
echo ""

echo "Port 3001 (a-reference-front):"
curl -k -s -o /dev/null -w "%{http_code}" https://localhost:3001/
echo ""

echo "Port 3003 (a-user-front):"
curl -k -s -o /dev/null -w "%{http_code}" https://localhost:3003/
echo ""

echo "=========================================="
echo "✅ CORRECTION TERMINÉE"
echo "=========================================="
echo ""
echo "URLs à tester depuis votre navigateur :"
echo "  - https://100.48.20.109:3001  (a-reference-front)"
echo "  - https://100.48.20.109:3002  (gestion-forum-front)"
echo "  - https://100.48.20.109:3003  (a-user-front)"
echo "  - https://100.48.20.109:8080/actuator/health  (Gateway)"
echo ""
