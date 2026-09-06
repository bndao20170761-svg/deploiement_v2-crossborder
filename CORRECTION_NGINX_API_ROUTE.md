# Correction route /api/ dans nginx-https.conf

## ❌ PROBLÈME IDENTIFIÉ

**Frontend** : `POST https://100.48.20.109/api/user-auth/login` → **403 Forbidden**
**Postman** : `POST https://100.48.20.109/api/user-auth/login` → **404 Not Found**

##Cause

Dans `nginx-https.conf`, l'ordre des `location` était incorrect :

```nginx
# ❌ MAUVAIS ORDRE (ancien)
location / { ... }           # Matche TOUT, y compris /api/
location /api/ { ... }       # N'est jamais atteint !
```

Nginx évalue les locations dans l'ordre, donc `/api/user-auth/login` était intercepté par `location /` et envoyé vers `a-reference-front` au lieu du gateway !

## ✅ CORRECTION APPLIQUÉE

```nginx
# ✅ BON ORDRE (corrigé)
location /api/ {
    proxy_pass http://gateway-pvvih:8080/api/;
    ...
}

location / {
    proxy_pass http://a-reference-front:80;
    ...
}
```

**Règle Nginx** : Les routes **spécifiques** doivent être **AVANT** les routes **génériques**.

## 📋 DÉPLOIEMENT

### 1. Sur votre PC (PowerShell)

```powershell
git add nginx-https.conf CORRECTION_NGINX_API_ROUTE.md
git commit -m "fix: ordre des location nginx - /api/ avant /"
git push origin main
```

### 2. Sur le serveur AWS (SSH)

```bash
cd ~/deploiement_v2-crossborder
git pull
docker compose restart nginx-https
sleep 5
docker logs nginx-https --tail 30
```

### 3. TEST

1. **Test Postman** : `POST https://100.48.20.109/api/user-auth/login`
   - Body (JSON) :
     ```json
     {
       "username": "ibdiop@gmail.com",
       "password": "passe123"
     }
     ```
   - Résultat attendu : **200 OK** avec un token JWT

2. **Test navigateur** : `https://100.48.20.109/login`
   - Entrez vos identifiants
   - Résultat attendu : Connexion réussie, redirection vers `/`

## 🔍 VÉRIFICATION

### Vérifier que la route /api/ est active

```bash
# Sur le serveur
docker exec nginx-https nginx -t
docker logs nginx-https --tail 50
```

### Vérifier dans le navigateur (F12)

1. Onglet **Network** → Filtrez "XHR"
2. Essayez de vous connecter
3. Vérifiez la requête `user-auth/login` :
   - ✅ Status : **200** (au lieu de 403/404)
   - ✅ Response : contient `{ "accessToken": "...", "token": "..." }`

## 🎯 APRÈS LA CORRECTION

Une fois la connexion fonctionnelle :

1. Connectez-vous sur `https://100.48.20.109/login`
2. Allez sur la page Cartographie
3. Cliquez "Géolocaliser"
4. **Le navigateur demande la permission GPS !** ✅
5. Votre position s'affiche avec un marqueur bleu ✅

## 📝 RÉSUMÉ TECHNIQUE

### Flux correct après correction

```
Navigateur
  ↓ POST https://100.48.20.109/api/user-auth/login
nginx-https (port 443)
  ↓ location /api/ matche
  ↓ proxy_pass http://gateway-pvvih:8080/api/
Gateway PVVIH (port 8080)
  ↓ Route vers gestion-user
gestion-user (port 8080)
  ↓ /api/user-auth/login → /api/auth/login (rewrite dans gateway)
  ↓ Authentification + génération JWT
  ↓ Retour token
```

### Ordre d'évaluation Nginx

Nginx évalue les locations selon ces règles de priorité :
1. `location = /exact` (correspondance exacte)
2. `location ^~ /prefix` (correspondance préfixe prioritaire)
3. `location ~ regex` (regex case-sensitive)
4. `location ~* regex` (regex case-insensitive)
5. `location /prefix` (correspondance préfixe, ordre d'apparition)

Dans notre cas, on utilise des préfixes simples, donc **l'ordre dans le fichier compte** !

## ⚠️ IMPORTANT

Après ce changement :
- ✅ `/api/*` → Gateway
- ✅ `/*` (tout le reste) → a-reference-front
- ✅ Plus de conflit de routing

Les ports 3001 et 3002 sont aussi activés en HTTPS pour accéder directement à `/user` et `/forum` si nécessaire.
