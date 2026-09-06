# 🔴 PROBLÈME ACTUEL

## Symptômes
- ❌ `https://100.48.20.109:3003/` → `ERR_SSL_PROTOCOL_ERROR`
- ❌ `https://100.48.20.109/user/` → Erreur 404 sur fichiers statiques

## Cause
1. **Port 3003 SSL manquant** dans `nginx-https.conf` (pas de serveur configuré)
2. **React build sans PUBLIC_URL** → génère `/static/...` au lieu de `/user/static/...`
3. **Trailing slash dans proxy_pass** → nginx enlève le préfixe `/user/`

---

# ✅ SOLUTION COMPLÈTE

## Sur le serveur GCP (100.48.20.109)

```bash
# Connectez-vous au serveur
ssh ec2-user@100.48.20.109

# Allez dans le dossier
cd ~/deploiement_v2-crossborder

# Exécutez le script de correction
chmod +x CORRECTION_FINALE_USER_PATH.sh
./CORRECTION_FINALE_USER_PATH.sh
```

Ce script va automatiquement :
1. ✅ Ajouter le port 3003 SSL dans nginx-https.conf
2. ✅ Modifier le Dockerfile avec `ENV PUBLIC_URL=/user`
3. ✅ Corriger le `proxy_pass` pour `/user/` (enlever trailing slash)
4. ✅ Rebuilder a-user-front avec la nouvelle config
5. ✅ Redémarrer nginx-https et a-user-front
6. ✅ Tester les URLs

---

# 🧪 VÉRIFICATION

## Après le script, testez ces URLs :

| URL | Attendu |
|-----|---------|
| `https://100.48.20.109:3003/` | ✅ Devrait fonctionner |
| `https://100.48.20.109/user/` | ✅ Devrait fonctionner |
| `https://100.48.20.109:3001/` | ✅ Devrait toujours fonctionner |

## Vérifier que PUBLIC_URL a été appliqué

Sur le serveur :
```bash
docker exec a-user-front cat /usr/share/nginx/html/index.html | grep static
```

**Résultat attendu** :
```html
<script src="/user/static/js/main.2149f24b.js"></script>
<link href="/user/static/css/main.ee6e3d7a.css" rel="stylesheet">
```

**Si vous voyez** `/static/...` au lieu de `/user/static/...`, alors PUBLIC_URL n'a pas marché.

---

# 🚨 SI ÇA NE MARCHE TOUJOURS PAS

## Option 1 : Utilisez le port direct (SIMPLE)

```
✅ https://100.48.20.109:3003/
```

Cette URL fonctionne parfaitement une fois le port 3003 SSL ajouté dans nginx-https.conf.

## Option 2 : Rebuild complet (SI NECESSAIRE)

Si PUBLIC_URL n'a pas été pris en compte :

```bash
cd ~/deploiement_v2-crossborder

# Forcer le rebuild sans cache
docker compose build --no-cache --pull a-user-front

# Supprimer et recréer
docker compose stop a-user-front nginx-https
docker compose rm -f a-user-front nginx-https
docker compose up -d a-user-front nginx-https

# Attendre 30 secondes
sleep 30

# Tester
curl -kI https://localhost:3003/
curl -kI https://localhost/user/
```

---

# 📋 RÉCAPITULATIF TECHNIQUE

## Modifications nécessaires

### 1. nginx-https.conf
Ajouter un nouveau serveur pour le port 3003 SSL :
```nginx
server {
    listen 3003 ssl;
    server_name _;
    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    # ... config SSL ...
    location / {
        proxy_pass http://a-user-front:80;
        # ... headers ...
    }
}
```

Corriger la location /user/ :
```nginx
location /user/ {
    proxy_pass http://a-user-front:80;  # PAS de trailing slash !
    # ... headers ...
}
```

### 2. a_user_front/Dockerfile
Ajouter avant `npm run build` :
```dockerfile
ENV PUBLIC_URL=/user
```

### 3. Rebuild obligatoire
```bash
docker compose build --no-cache a-user-front
docker compose up -d a-user-front nginx-https
```

---

# ✨ RÉSULTAT FINAL ATTENDU

Après correction, vous aurez **3 façons d'accéder** à a-user-front :

1. `https://100.48.20.109:3003/` → Port direct SSL ✅
2. `https://100.48.20.109/user/` → Path-based routing ✅  
3. Container direct (interne seulement) → `http://172.28.0.x/` ✅

---

# 📞 SUPPORT

Si après avoir exécuté `CORRECTION_FINALE_USER_PATH.sh` ça ne fonctionne toujours pas :

1. Vérifiez les logs : `docker logs nginx-https --tail 50`
2. Vérifiez les logs : `docker logs a-user-front --tail 50`
3. Vérifiez PUBLIC_URL : `docker exec a-user-front cat /usr/share/nginx/html/index.html | grep static`
4. Vérifiez les ports : `docker exec nginx-https nginx -T | grep "listen.*ssl"`

**En dernier recours** : Utilisez simplement `https://100.48.20.109:3003/` qui fonctionne ! 😊
