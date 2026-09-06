# ✅ SOLUTION SIMPLE - /user/ qui marche comme /

## 🎯 LE PROBLÈME

```
https://100.48.20.109/        → ✅ Fonctionne (a-reference-front)
https://100.48.20.109/user/   → ❌ 404 sur /static/...
```

## 🔍 POURQUOI ?

### Ce qui MARCHE (a-reference-front sur /)

```nginx
location / {
    proxy_pass http://a-reference-front:80;
                                       ^^^ PAS DE TRAILING SLASH
}
```

- Requête: `GET https://100.48.20.109/static/css/main.css`
- Nginx envoie: `GET http://a-reference-front:80/static/css/main.css`
- ✅ Fichier trouvé !

### Ce qui NE MARCHE PAS (a-user-front sur /user/)

```nginx
location /user/ {
    proxy_pass http://a-user-front:80/;
                                     ^^^ AVEC TRAILING SLASH
}
```

- Requête: `GET https://100.48.20.109/static/css/main.css`
- Nginx cherche: `location /user/` → NON MATCHÉ (pas de /user/ dans le chemin)
- Nginx utilise `location /` → proxy vers a-reference-front
- ❌ Fichier non trouvé !

**Pourquoi les chemins sont /static/... et pas /user/static/... ?**
Parce que React a été buildé SANS `PUBLIC_URL=/user`, donc il génère des chemins relatifs à la racine.

## ✅ LA SOLUTION

Copier EXACTEMENT ce qui marche pour `/` :

```nginx
location /user {
    # Rewrite pour transformer /user/... en /...
    rewrite ^/user/(.*)$ /$1 break;
    rewrite ^/user$ / break;
    
    proxy_pass http://a-user-front:80;
                                   ^^^ PAS DE TRAILING SLASH
}
```

### Comment ça marche ?

1. **Requête**: `GET https://100.48.20.109/user/`
   - Rewrite: `/user/` → `/`
   - Proxy: `GET http://a-user-front:80/`
   - ✅ index.html

2. **Requête**: `GET https://100.48.20.109/user/static/css/main.css`
   - Rewrite: `/user/static/css/main.css` → `/static/css/main.css`
   - Proxy: `GET http://a-user-front:80/static/css/main.css`
   - ✅ Fichier CSS

3. **Requête**: `GET https://100.48.20.109/static/css/main.css` (depuis le HTML)
   - Location: ne matche PAS `/user` → utilise `/`
   - Proxy: `GET http://a-reference-front:80/static/css/main.css`
   - ⚠️ **PROBLÈME**: Le CSS de a-user-front est demandé à a-reference-front !

**ATTENDEZ...** Il y a ENCORE un problème !

## 🚨 LE VRAI PROBLÈME

React génère dans `index.html`:
```html
<link href="/static/css/main.css">
<script src="/static/js/main.js"></script>
```

Ces chemins sont **absolus** (commencent par `/`), donc le navigateur demande:
- `https://100.48.20.109/static/css/main.css` (sans `/user/` !)

Et nginx route ça vers `location /` → a-reference-front ❌

## ✅ LA VRAIE SOLUTION

Il faut que React génère:
```html
<link href="/user/static/css/main.css">
<script src="/user/static/js/main.js"></script>
```

**Pour ça, il faut rebuilder avec `PUBLIC_URL=/user`** !

## 📋 ÉTAPES DE CORRECTION

### Sur le serveur GCP:

```bash
ssh ec2-user@100.48.20.109
cd ~/deploiement_v2-crossborder

# Exécuter le script de correction
chmod +x FIX_USER_PATH_FINAL.sh
./FIX_USER_PATH_FINAL.sh
```

Ce script va:
1. ✅ Modifier `nginx-https.conf` avec la config rewrite
2. ✅ Corriger les doublons de ports
3. ✅ Redémarrer nginx-https
4. ⚠️ **MAIS il faut AUSSI rebuilder a-user-front avec PUBLIC_URL=/user**

### Rebuild avec PUBLIC_URL:

```bash
# Modifier le Dockerfile
nano a_user_front/Dockerfile

# Ajouter APRÈS les autres ENV:
ENV PUBLIC_URL=/user

# Rebuilder
docker compose build --no-cache a-user-front
docker compose stop a-user-front
docker compose rm -f a-user-front
docker compose up -d a-user-front

# Attendre 30 secondes
sleep 30

# Vérifier que PUBLIC_URL a été appliqué
docker exec a-user-front cat /usr/share/nginx/html/index.html | grep static
# Devrait afficher: <script src="/user/static/js/main.xxx.js">
```

## 🎉 RÉSULTAT ATTENDU

Après correction:

```
✅ https://100.48.20.109/           → a-reference-front
✅ https://100.48.20.109/user/      → a-user-front (avec rewrite + PUBLIC_URL)
✅ https://100.48.20.109:3001/      → a-reference-front (port direct)
✅ https://100.48.20.109:3003/      → a-user-front (port direct)
```

## 💡 ALTERNATIVE SIMPLE

Si vous ne voulez PAS rebuilder a-user-front:

**Utilisez simplement le port direct qui fonctionne** :
```
✅ https://100.48.20.109:3003/
```

C'est plus simple, plus fiable, et ça marche DÉJÀ ! 😊
