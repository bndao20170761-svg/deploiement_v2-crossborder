# ✅ Correction des routes nginx-https

## 🐛 Problème identifié

Les routes `/user/` et `/forum/` n'étaient **pas configurées** dans nginx-https.conf.

### Comportement avant correction :
- `https://100.48.20.109/` → a-reference-front ✅
- `https://100.48.20.109/user` → a-reference-front ❌ (mauvais)
- `https://100.48.20.109/forum` → a-reference-front ❌ (mauvais)

### Comportement après correction :
- `https://100.48.20.109/` → a-reference-front ✅
- `https://100.48.20.109/user/` → a-user-front ✅
- `https://100.48.20.109/forum/` → gestion-forum-front ✅
- `https://100.48.20.109/api/` → gateway-pvvih ✅

## 📝 Modifications effectuées

### nginx-https.conf

Ajout de 2 nouvelles routes dans le serveur port 443 :

```nginx
# a_user_front - Interface utilisateur
location /user/ {
    proxy_pass http://a-user-front:80/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_redirect off;
}

# gestion_forum_front - Forum
location /forum/ {
    proxy_pass http://gestion-forum-front:80/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_redirect off;
}
```

## 🚀 Déploiement

### Étape 1 : Sur votre PC - Push sur GitHub

```powershell
cd "C:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder"

git add nginx-https.conf docker-compose.yml
git commit -m "fix: ajout routes /user/ et /forum/ dans nginx-https + exposition port 3003"
git push origin main
```

### Étape 2 : Sur le serveur AWS - Pull et redéployer

```bash
# Connexion SSH
ssh ec2-user@100.48.20.109

# Aller dans le dossier
cd ~/deploiement_v2-crossborder

# Pull les changements
git pull

# Redémarrer nginx-https pour appliquer la nouvelle config
docker compose restart nginx-https

# Attendre 5 secondes
sleep 5

# Vérifier que nginx a bien redémarré
docker ps | grep nginx-https
docker logs nginx-https --tail 20
```

### Étape 3 : Tester les nouvelles routes

```bash
# Test des routes depuis le serveur
curl -I https://localhost/
curl -I https://localhost/user/
curl -I https://localhost/forum/
curl -I https://localhost/api/
```

Ou depuis votre PC dans un navigateur :
```
https://100.48.20.109/          → a-reference-front
https://100.48.20.109/user/     → a-user-front
https://100.48.20.109/forum/    → gestion-forum-front
```

## 📊 Architecture après correction

```
Navigateur HTTPS (port 443)
    ↓
nginx-https
    ├─→ /              → a-reference-front:80
    ├─→ /user/         → a-user-front:80
    ├─→ /forum/        → gestion-forum-front:80
    └─→ /api/          → gateway-pvvih:8080

Accès directs (HTTP) :
    ├─→ :3001          → nginx-https (a-user-front via SSL)
    ├─→ :3002          → nginx-https (gestion-forum-front via SSL)
    └─→ :3003          → a-user-front:80 (accès direct)
```

## ⚠️ Points importants

### Slash final `/`
Les routes utilisent un **slash final** :
- `location /user/` (avec slash)
- `proxy_pass http://a-user-front:80/` (avec slash)

Cela signifie :
- `https://100.48.20.109/user/` ✅ fonctionne
- `https://100.48.20.109/user` → redirigé automatiquement vers `/user/`

### Ordre des routes dans nginx
L'ordre est **important** :
1. `/api/` (plus spécifique)
2. `/user/` (plus spécifique)
3. `/forum/` (plus spécifique)
4. `/` (attrape tout le reste - doit être en dernier)

## 🔍 Vérification après déploiement

### Vérifier que nginx a bien chargé la config

```bash
# Sur le serveur
docker exec nginx-https nginx -t
```

Vous devriez voir :
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Vérifier les logs nginx

```bash
docker logs nginx-https --tail 50
```

### Tester toutes les URLs

```bash
# Test complet
echo "Test a-reference-front:"
curl -I https://100.48.20.109/ 2>&1 | grep HTTP

echo "Test a-user-front:"
curl -I https://100.48.20.109/user/ 2>&1 | grep HTTP

echo "Test gestion-forum-front:"
curl -I https://100.48.20.109/forum/ 2>&1 | grep HTTP

echo "Test gateway:"
curl -I https://100.48.20.109/api/ 2>&1 | grep HTTP
```

Tous devraient retourner **HTTP/1.1 200 OK** ou **HTTP/2 200**.

## 📋 Résumé des accès

| Service | URL HTTPS (via nginx) | URL HTTP directe | Port Docker |
|---------|----------------------|------------------|-------------|
| a-reference-front | https://100.48.20.109/ | - | Interne 80 |
| a-user-front | https://100.48.20.109/user/ | http://100.48.20.109:3003 | 3003→80 |
| gestion-forum-front | https://100.48.20.109/forum/ | - | Interne 80 |
| Gateway API | https://100.48.20.109/api/ | - | Interne 8080 |
| Nginx (a-user via SSL) | https://100.48.20.109:3001/ | - | 3001 (SSL) |
| Nginx (forum via SSL) | https://100.48.20.109:3002/ | - | 3002 (SSL) |

## 🎯 Recommandations

Pour les utilisateurs finaux, utilisez **toujours** les URLs via nginx sur le port 443 :
- ✅ `https://100.48.20.109/` pour la référence
- ✅ `https://100.48.20.109/user/` pour les utilisateurs
- ✅ `https://100.48.20.109/forum/` pour le forum

Les ports 3001, 3002, 3003 sont pour :
- Le debugging
- Les tests de développement
- L'accès direct aux conteneurs

## 🔄 Si nginx-https ne démarre pas

Si nginx refuse de démarrer après le changement :

```bash
# Voir l'erreur exacte
docker logs nginx-https

# Tester la config
docker exec nginx-https nginx -t

# Redémarrer avec force
docker compose down nginx-https
docker compose up -d nginx-https

# Vérifier
docker ps | grep nginx
```

---

## ✅ Checklist finale

- [ ] Changements pushés sur GitHub
- [ ] git pull effectué sur le serveur
- [ ] nginx-https redémarré
- [ ] Test `https://100.48.20.109/` → OK
- [ ] Test `https://100.48.20.109/user/` → OK
- [ ] Test `https://100.48.20.109/forum/` → OK
- [ ] Profil utilisateur corrigé dans a-reference-front Header.js
- [ ] Port 3003 exposé pour a-user-front (optionnel)
