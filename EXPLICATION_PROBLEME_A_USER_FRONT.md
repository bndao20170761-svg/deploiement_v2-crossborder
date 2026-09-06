# 🐛 Problème: a-user-front 404 sur fichiers statiques

## ❌ Erreur observée

```
GET https://100.48.20.109/static/js/main.2149f24b.js
net::ERR_ABORTED 404 (Not Found)

Refused to execute script because MIME type ('text/html') is not executable
```

## 🔍 Cause du problème

**C'est le même problème que gestion-forum-front !**

1. React génère les fichiers avec des chemins relatifs : `/static/js/...`
2. nginx-https proxie vers `/user/` → le conteneur reçoit la requête sur `/user/`
3. Mais le `nginx.conf` de `a-user-front` cherche les fichiers à `/static/js/...` au lieu de `/user/static/js/...`

### Architecture du problème

```
Navigateur
    ↓
    GET https://100.48.20.109/user/
    
nginx-https (nginx-https.conf)
    ↓
    location /user/ {
        proxy_pass http://a-user-front:80;  ← Envoie vers le conteneur
    }
    
a-user-front:80 (nginx.conf du conteneur)
    ↓
    location / {
        try_files $uri /index.html;  ← ❌ Cherche à la racine !
    }
    
❌ PROBLÈME: Les fichiers sont demandés sur /static/js/...
            mais devraient être sur /user/static/js/...
```

## ✅ Solution appliquée

Modifier `a_user_front/nginx.conf` pour gérer le basename `/user/` :

```nginx
# Fichiers statiques - servis depuis /user/
location ~ ^/user/(static|images|assets)/ {
    alias /usr/share/nginx/html/$1/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}

# Route principale /user/ - SPA routing
location /user/ {
    alias /usr/share/nginx/html/;
    try_files $uri $uri/ /index.html;
    index index.html;
}

# Route racine / - redirige vers /user/
location = / {
    return 301 /user/;
}
```

## 📋 Étapes pour appliquer le fix

### Sur votre PC

```powershell
cd "C:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder"

# Ajouter les changements
git add a_user_front/nginx.conf
git add fix-a-user-front-404.sh
git commit -m "fix: configuration nginx pour a-user-front basename /user/"
git push origin main
```

### Sur le serveur AWS

```bash
# Connexion
ssh ec2-user@100.48.20.109

# Aller dans le dossier
cd ~/deploiement_v2-crossborder

# Pull les changements
git pull

# Exécuter le script de fix
chmod +x fix-a-user-front-404.sh
./fix-a-user-front-404.sh
```

### Ou manuellement:

```bash
cd ~/deploiement_v2-crossborder
git pull

# Rebuild
docker compose stop a-user-front
docker compose build --no-cache a-user-front
docker compose up -d a-user-front

# Attendre
sleep 10

# Vérifier
docker ps | grep a-user-front
docker logs a-user-front --tail 20
```

## 🧪 Tests après le fix

### 1. Test accès via nginx-https (recommandé)
```
https://100.48.20.109/user/
```

**Résultat attendu :** L'application s'affiche correctement

### 2. Test accès direct port 3003
```
http://100.48.20.109:3003
```

**Résultat attendu :** Redirige vers `/user/` puis affiche l'application

### 3. Test fichiers statiques
```
https://100.48.20.109/user/static/js/main.2149f24b.js
```

**Résultat attendu :** Le fichier JS se charge (pas de 404)

## 📊 Comparaison avant/après

### ❌ AVANT (ne marche pas)

```nginx
# nginx.conf
location / {
    try_files $uri $uri/ /index.html;
}
```

Requête: `GET /user/static/js/main.js`
- nginx cherche: `/usr/share/nginx/html/user/static/js/main.js`
- Résultat: **404 Not Found**

### ✅ APRÈS (fonctionne)

```nginx
# nginx.conf
location ~ ^/user/(static|images|assets)/ {
    alias /usr/share/nginx/html/$1/;
    try_files $uri =404;
}
```

Requête: `GET /user/static/js/main.js`
- nginx cherche: `/usr/share/nginx/html/static/js/main.js`
- Résultat: **200 OK** ✅

## 🎯 Résumé des 3 frontends

| Frontend | Basename | nginx.conf | Status |
|----------|----------|------------|--------|
| a-reference-front | `/` (racine) | Simple | ✅ OK |
| gestion-forum-front | `/forum/` | Avec alias | ✅ OK (déjà corrigé) |
| a-user-front | `/user/` | Avec alias | 🔧 À corriger |

## 🔄 Vérification complète

Après avoir appliqué le fix, testez tous les frontends :

```bash
# Test des 3 frontends
curl -I https://100.48.20.109/
curl -I https://100.48.20.109/forum/
curl -I https://100.48.20.109/user/

# Tous devraient retourner 200 OK
```

## 📝 Notes importantes

1. **package.json** : Le `"homepage": "/user"` est déjà configuré ✅
2. **docker-compose.yml** : Le port 3003 est maintenant exposé ✅
3. **nginx-https.conf** : La configuration proxy est correcte ✅
4. **a_user_front/nginx.conf** : C'était le seul problème ❌ → ✅

## 🚀 Prochaines étapes

Après avoir corrigé `a-user-front` :

1. ✅ Vérifier que les 3 frontends fonctionnent
2. ✅ Tester la navigation entre les applications
3. ✅ Vérifier l'authentification
4. ✅ Tester les appels API

---

**Temps estimé pour le fix : 3-5 minutes** (pull + rebuild + redémarrage)
