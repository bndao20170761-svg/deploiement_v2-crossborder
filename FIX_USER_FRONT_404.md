# 🔧 Fix: Erreur 404 sur /user/ - Static files non trouvés

## 🐛 Problème

Quand on accède à `https://100.48.20.109/user/`, on obtient:
```
GET https://100.48.20.109/static/js/main.2149f24b.js net::ERR_ABORTED 404 (Not Found)
MIME type ('text/html') is not executable
```

### Cause

React génère des chemins **absolus** dans index.html :
```html
<script src="/static/js/main.2149f24b.js"></script>
```

Avec nginx configuré sur `/user/`, le navigateur cherche :
- ❌ `https://100.48.20.109/static/js/main.2149f24b.js` (pas trouvé!)
- ✅ Devrait chercher : `https://100.48.20.109/user/static/js/main.2149f24b.js`

## ✅ Solution appliquée

### Modification de `nginx-https.conf`

J'ai ajouté **deux corrections** :

1. **Rewrite des URLs** : `/user/xxx` → `/xxx` avant de passer au backend
2. **Injection de `<base href>`** : Force le navigateur à utiliser `/user/` comme préfixe

```nginx
# a_user_front - Interface utilisateur
location /user {
    # Réécrit /user vers / et /user/xxx vers /xxx
    rewrite ^/user$ /user/ permanent;
    rewrite ^/user/(.*)$ /$1 break;
    
    proxy_pass http://a-user-front:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Important pour que React comprenne le base path
    sub_filter '<head>' '<head><base href="/user/">';
    sub_filter_once on;
    sub_filter_types text/html;
}
```

### Même correction pour `/forum`

```nginx
location /forum {
    rewrite ^/forum$ /forum/ permanent;
    rewrite ^/forum/(.*)$ /$1 break;
    
    proxy_pass http://gestion-forum-front:80;
    ...
    
    sub_filter '<head>' '<head><base href="/forum/">';
    sub_filter_once on;
    sub_filter_types text/html;
}
```

## 🚀 Comment appliquer sur AWS

### Étape 1 : Push sur GitHub

```powershell
# Sur votre PC
cd "C:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder"

git add nginx-https.conf docker-compose.yml
git commit -m "fix: correction routing nginx pour /user et /forum + expose port 3003"
git push origin main
```

### Étape 2 : Redéployer sur le serveur

```bash
# Connexion SSH
ssh ec2-user@100.48.20.109

# Aller dans le dossier
cd ~/deploiement_v2-crossborder

# Pull les changements
git pull

# Redémarrer nginx-https avec la nouvelle config
docker compose restart nginx-https

# Attendre 5 secondes
sleep 5

# Vérifier que nginx a bien redémarré
docker ps | grep nginx-https
docker logs nginx-https --tail 20
```

### Étape 3 : Tester

1. Ouvrez votre navigateur
2. Videz le cache : **Ctrl + Shift + R** (important!)
3. Accédez à : `https://100.48.20.109/user/`
4. Les fichiers JS/CSS devraient maintenant se charger

## 🔍 Vérification

### Dans la console du navigateur (F12)

Avant la correction :
```
❌ GET https://100.48.20.109/static/js/main.js 404 (Not Found)
```

Après la correction :
```
✅ GET https://100.48.20.109/user/static/js/main.js 200 (OK)
```

### Vérifier le HTML retourné

```bash
# Sur le serveur
curl -s https://100.48.20.109/user/ | grep "<base"
```

Vous devriez voir :
```html
<head><base href="/user/">
```

## 📊 Comment ça marche

### Flux de la requête

```
1. Navigateur demande: https://100.48.20.109/user/
   ↓
2. Nginx reçoit: /user/
   ↓
3. Rewrite: /user/ → /
   ↓
4. Proxy vers: http://a-user-front:80/
   ↓
5. a-user-front retourne: index.html
   ↓
6. Nginx injecte: <base href="/user/">
   ↓
7. Navigateur reçoit le HTML avec <base href="/user/">
   ↓
8. Navigateur voit: <script src="/static/js/main.js">
   ↓
9. Avec <base href="/user/">, le navigateur calcule:
   /user/ + static/js/main.js = /user/static/js/main.js ✅
```

### Sans `<base href>` (ancien comportement)

```
Navigateur voit: <script src="/static/js/main.js">
↓
Demande: https://100.48.20.109/static/js/main.js ❌
```

### Avec `<base href="/user/">` (nouveau)

```
Navigateur voit: <script src="/static/js/main.js">
↓
Calcule: base (/user/) + src (/static/js/main.js)
↓
Demande: https://100.48.20.109/user/static/js/main.js ✅
```

## ⚠️ Alternative : Rebuild React avec PUBLIC_URL

Si la solution nginx ne fonctionne pas, on peut rebuilder React :

### Pour a_user_front

```dockerfile
# Dans a_user_front/Dockerfile
ARG PUBLIC_URL=/user
ENV PUBLIC_URL=$PUBLIC_URL
RUN npm run build
```

Puis rebuilder :
```bash
docker compose build --no-cache a-user-front
docker compose up -d a-user-front
```

## 🎯 Résumé

| Problème | Cause | Solution |
|----------|-------|----------|
| 404 sur /static/js/... | Chemins absolus React | Injection `<base href="/user/">` |
| CSS refuse de charger | MIME type incorrect | Fichiers chargés depuis bon chemin |
| Port 3003 a-user-front | Commenté dans compose | Décommenté ports: 3003:80 |

## 📝 Fichiers modifiés

1. ✅ `nginx-https.conf` - Ajout rewrite + sub_filter
2. ✅ `docker-compose.yml` - Décommenté port 3003 pour a-user-front

---

**⏱️ Temps estimé** : 2-3 minutes pour appliquer
**🔄 Requiert** : Redémarrage de nginx-https uniquement
