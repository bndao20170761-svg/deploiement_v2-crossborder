# 🔧 Correction erreur 404 - /user/ et /forum/

## ❌ Problème

Lorsque vous accédez à `https://100.48.20.109/user/`, vous obtenez :
```
GET https://100.48.20.109/static/js/main.2149f24b.js net::ERR_ABORTED 404 (Not Found)
Refused to execute script because its MIME type ('text/html') is not executable
```

## 🔍 Cause

1. **nginx-https.conf** utilisait un `rewrite` qui cassait les chemins des fichiers statiques
2. **package.json** des frontends n'avait pas le paramètre `homepage` configuré

## ✅ Corrections appliquées

### 1. nginx-https.conf

**Avant :**
```nginx
location /user {
    rewrite ^/user/(.*)$ /$1 break;  # ❌ Casse les chemins statiques
    proxy_pass http://a-user-front:80;
    ...
}
```

**Après :**
```nginx
location /user/ {
    proxy_pass http://a-user-front:80/;  # ✅ Simple proxy sans rewrite
    ...
}

location = /user {
    return 301 /user/;  # ✅ Redirection propre
}
```

### 2. a_user_front/package.json

**Ajout :**
```json
{
  "name": "front_user_lastapp",
  "version": "0.1.0",
  "private": true,
  "homepage": "/user",  // ✅ Ajouté
  "dependencies": {
    ...
  }
}
```

### 3. gestion_forum_front/package.json

**Ajout :**
```json
{
  "name": "gestion_forum_front",
  "version": "0.1.0",
  "private": true,
  "homepage": "/forum",  // ✅ Ajouté
  "dependencies": {
    ...
  }
}
```

## 🚀 Déploiement de la correction

### Sur le serveur AWS (100.48.20.109)

```bash
# 1. Connexion SSH
ssh ec2-user@100.48.20.109

# 2. Aller dans le dossier
cd ~/deploiement_v2-crossborder

# 3. Pull les changements
git pull

# 4. Arrêter les services concernés
docker compose stop nginx-https a-user-front gestion-forum-front

# 5. Rebuild les frontends (pour prendre en compte le homepage)
docker compose build --no-cache a-user-front gestion-forum-front

# 6. Redémarrer tous les services
docker compose up -d

# 7. Attendre 20 secondes
sleep 20

# 8. Vérifier
docker ps | grep -E "nginx|user-front|forum-front"
docker logs nginx-https --tail 20
docker logs a-user-front --tail 20
docker logs gestion-forum-front --tail 20
```

## 🧪 Tests après correction

### Test 1 : Page d'accueil
```bash
curl -I https://100.48.20.109/
# Devrait retourner 200 OK
```

### Test 2 : User front
```bash
curl -I https://100.48.20.109/user/
# Devrait retourner 200 OK
```

### Test 3 : Forum front
```bash
curl -I https://100.48.20.109/forum/
# Devrait retourner 200 OK
```

### Test 4 : API
```bash
curl -I https://100.48.20.109/api/auth/health
# Devrait retourner 200 OK
```

### Test 5 : Fichiers statiques user
```bash
curl -I https://100.48.20.109/user/static/js/main.2149f24b.js
# Devrait retourner 200 OK avec Content-Type: application/javascript
```

## 📊 Résultat attendu

### Dans le navigateur

1. **https://100.48.20.109/** → a-reference-front ✅
2. **https://100.48.20.109/user/** → a-user-front ✅
3. **https://100.48.20.109/forum/** → gestion-forum-front ✅
4. **https://100.48.20.109/api/...** → gateway-pvvih ✅

### Console du navigateur (F12)

**Avant :**
```
❌ GET https://100.48.20.109/static/js/main.xxx.js 404 (Not Found)
❌ MIME type ('text/html') is not executable
```

**Après :**
```
✅ GET https://100.48.20.109/user/static/js/main.xxx.js 200 (OK)
✅ Content-Type: application/javascript
```

## 🔍 Vérification détaillée

### Vérifier la configuration nginx

```bash
# Sur le serveur
docker exec nginx-https nginx -t
# Devrait afficher: syntax is ok, test is successful
```

### Vérifier que les fichiers statiques sont accessibles

```bash
# Depuis le serveur
docker exec nginx-https wget -O- http://a-user-front:80/static/js/main.2149f24b.js | head -n 5
# Devrait afficher du code JavaScript
```

### Vérifier les logs nginx en temps réel

```bash
docker logs -f nginx-https
# Puis ouvrir https://100.48.20.109/user/ dans le navigateur
# Vous devriez voir des requêtes 200 OK
```

## 🎯 Architecture finale

```
Navigateur
    ↓
https://100.48.20.109/
    ├─→ /                → nginx-https → a-reference-front:80
    ├─→ /user/           → nginx-https → a-user-front:80
    ├─→ /forum/          → nginx-https → gestion-forum-front:80
    └─→ /api/            → nginx-https → gateway-pvvih:8080
```

### Chemins des fichiers statiques

```
https://100.48.20.109/static/...              → a-reference-front
https://100.48.20.109/user/static/...         → a-user-front
https://100.48.20.109/forum/static/...        → gestion-forum-front
```

## 📝 Changements de code

### Fichiers modifiés

1. ✅ `nginx-https.conf` - Simplification des règles proxy
2. ✅ `a_user_front/package.json` - Ajout de `homepage: "/user"`
3. ✅ `gestion_forum_front/package.json` - Ajout de `homepage: "/forum"`

### Pas de changement nécessaire

- ❌ Pas besoin de modifier les composants React
- ❌ Pas besoin de modifier les routes
- ❌ Pas besoin de modifier les Dockerfiles

Le paramètre `homepage` dans package.json suffit pour que Create React App configure automatiquement les chemins.

## ⚡ Script de déploiement rapide

Créez `fix-404-deploy.sh` sur le serveur :

```bash
#!/bin/bash
cd ~/deploiement_v2-crossborder
git pull
docker compose stop nginx-https a-user-front gestion-forum-front
docker compose build --no-cache a-user-front gestion-forum-front
docker compose up -d
echo "✅ Déploiement terminé - Attendez 20 secondes puis testez"
```

Exécution :
```bash
chmod +x fix-404-deploy.sh
./fix-404-deploy.sh
```

## 🐛 Si le problème persiste

### 1. Vider le cache du navigateur

```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Vérifier que le build inclut le homepage

```bash
# Sur le serveur
docker exec a-user-front cat /usr/share/nginx/html/index.html | grep -o 'href="[^"]*"' | head -n 5
# Devrait montrer href="/user/..."
```

### 3. Vérifier les logs nginx

```bash
docker logs nginx-https --tail 50 | grep "user"
```

### 4. Tester directement le conteneur

```bash
# Test direct a-user-front
docker exec nginx-https wget -O- http://a-user-front:80/ | grep -o '<script src="[^"]*"'
# Devrait montrer <script src="/static/js/main.xxx.js">
```

## 📞 Support

Si vous rencontrez toujours des problèmes :

1. Vérifiez que git pull a bien récupéré les changements
2. Vérifiez que le build a bien été refait (pas de cache)
3. Videz complètement le cache du navigateur
4. Essayez en navigation privée
5. Consultez les logs : `docker logs nginx-https`

---

## 🎉 Résultat final

Après cette correction :

✅ `https://100.48.20.109/` → Page d'accueil (a-reference-front)
✅ `https://100.48.20.109/user/` → Interface utilisateur (a-user-front)
✅ `https://100.48.20.109/forum/` → Forum (gestion-forum-front)
✅ `https://100.48.20.109/api/...` → API Gateway
✅ Tous les fichiers statiques chargent correctement
✅ Pas d'erreur 404
✅ Pas d'erreur MIME type
