# 🚨 PROBLÈME : nginx-https.conf Non Synchronisé avec le Serveur

## Symptômes Observés

### 1. Erreurs SSL sur le Port 8080
```
POST https://100.48.20.109:8080/api/user-auth/login
❌ net::ERR_SSL_PROTOCOL_ERROR
❌ net::ERR_CONNECTION_RESET
```

### 2. Mauvaise Application Servie sur Port 3001
```
GET https://100.48.20.109:3001/vite.svg 404 (Not Found)
```
- Le port 3001 devrait servir `a-reference-front` (React avec CRA)
- Mais cherche `vite.svg` (qui vient de `a-user-front` avec Vite)
- **Conclusion** : nginx route mal les requêtes

## Cause Racine

Le fichier `nginx-https.conf` **local** (sur votre PC) a été modifié, mais le serveur GCP utilise **l'ancienne version**.

### Vérification

```bash
# Sur le serveur GCP
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep "listen 8080"

# Si VIDE ou incomplet → Confirmation du problème
```

## Solution

### Option 1 : Script Automatique (RECOMMANDÉ)

**Sur le serveur GCP**, exécutez :

```bash
cd ~/deploiement_v2-crossborder
chmod +x CORRIGER_NGINX_HTTPS_SUR_SERVEUR.sh
./CORRIGER_NGINX_HTTPS_SUR_SERVEUR.sh
```

Ce script :
1. ✅ Sauvegarde l'ancienne configuration
2. ✅ Crée la nouvelle configuration correcte
3. ✅ Redémarre nginx-https
4. ✅ Vérifie que tout fonctionne

### Option 2 : Transfert Manuel depuis Votre PC

**Sur votre PC Windows** :

```powershell
# Transférer le fichier corrigé
scp nginx-https.conf ec2-user@100.48.20.109:~/deploiement_v2-crossborder/

# Puis sur le serveur
ssh ec2-user@100.48.20.109
cd ~/deploiement_v2-crossborder
docker compose restart nginx-https
```

### Option 3 : Modification Directe sur le Serveur

**Sur le serveur GCP** :

```bash
cd ~/deploiement_v2-crossborder
nano nginx-https.conf

# Ajouter le bloc manquant pour port 8080 :
```

```nginx
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
```

Puis :
```bash
# Redémarrer nginx-https
docker compose restart nginx-https

# Vérifier
curl -k https://localhost:8080/actuator/health
```

## Vérification Post-Correction

### 1. Test Port 8080 (API Gateway)
```bash
curl -k https://localhost:8080/actuator/health
# Devrait retourner JSON, pas HTML
```

### 2. Test Port 3001 (a-reference-front)
```bash
curl -k https://localhost:3001/ | head -20
# Devrait retourner HTML avec CRA (Create React App)
# PAS de mention de "vite"
```

### 3. Test Port 3003 (a-user-front)
```bash
curl -k https://localhost:3003/ | head -20
# Devrait retourner HTML avec Vite
# Contient "/vite.svg"
```

### 4. Test Login depuis le Navigateur
```
https://100.48.20.109:3001
```
- Tester la connexion
- Devrait pouvoir appeler l'API sur port 8080
- Plus d'erreur `ERR_SSL_PROTOCOL_ERROR`

## Configuration Correcte Attendue

### Ports SSL Configurés dans nginx-https.conf
```
✅ Port 443  → a-reference-front (par défaut)
✅ Port 3001 → a-reference-front
✅ Port 3002 → gestion-forum-front
✅ Port 3003 → a-user-front
✅ Port 8080 → gateway-pvvih (API Gateway) ← CRITIQUE
```

### Vérification Rapide
```bash
docker exec nginx-https cat /etc/nginx/conf.d/default.conf | grep -E "listen.*ssl" | sort -u
```

Devrait afficher :
```
    listen 443 ssl;
    listen 3001 ssl;
    listen 3002 ssl;
    listen 3003 ssl;
    listen 8080 ssl;  ← SI MANQUANT = PROBLÈME
```

## Impact Attendu Après Correction

### ✅ Ce Qui Fonctionnera
- Login/authentification sur tous les frontends
- Appels API depuis les frontends vers le Gateway
- Chargement des données dynamiques (patients, hôpitaux, etc.)
- Navigation entre les pages
- Toutes les fonctionnalités CRUD

### ❌ Ce Qui NE Fonctionnera Toujours PAS
- Routing path-based `/user/`, `/forum/` (nécessite rebuild des frontends)
- Les URLs sans port continuent de ne pas fonctionner

## URLs Fonctionnelles Après Correction

```
✅ https://100.48.20.109:3001  → a-reference-front (Login OK)
✅ https://100.48.20.109:3002  → gestion-forum-front
✅ https://100.48.20.109:3003  → a-user-front
✅ https://100.48.20.109:8080  → API Gateway (Authentification + Données)
```

---

**Date** : 6 septembre 2026
**Priorité** : 🔥 CRITIQUE
**Statut** : EN ATTENTE D'EXÉCUTION SUR LE SERVEUR
