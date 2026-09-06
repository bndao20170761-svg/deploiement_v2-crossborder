# ✅ Fix: Erreur de connexion a-user-front

## 🔍 Problème identifié

Erreur affichée :
```
Erreur réseau : Impossible de joindre le serveur. 
Vérifiez que l'URL du Gateway (REACT_APP_GATEWAY_URL) 
inclut bien le port :8080.
```

## 🐛 Cause racine

1. Le fichier `.env` racine utilisait l'**ancienne IP GCP** (`13.60.231.157`)
2. Les URLs utilisaient `http` avec `:8080` au lieu de `https` via nginx
3. Le fallback dans `api.js` utilisait `http://100.48.20.109:8080`

## ✅ Corrections effectuées

### 1. Fichier `.env` (racine du projet)

**Avant** :
```env
PUBLIC_IP=13.60.231.157
REACT_APP_GATEWAY_URL=http://13.60.231.157:8080
REACT_APP_API_URL=http://13.60.231.157:8080/api
```

**Après** :
```env
PUBLIC_IP=100.48.20.109
REACT_APP_GATEWAY_URL=https://100.48.20.109
REACT_APP_API_URL=https://100.48.20.109/api
```

### 2. Fichier `a_user_front/src/assets/services/api.js`

**Avant** :
```javascript
baseURL: process.env.REACT_APP_GATEWAY_URL || 'http://100.48.20.109:8080',
```

**Après** :
```javascript
baseURL: process.env.REACT_APP_GATEWAY_URL || 'https://100.48.20.109',
```

### 3. Architecture nginx-https

Avec nginx-https, l'architecture est :
```
Navigateur → https://100.48.20.109 (port 443)
                ↓
            nginx-https
                ↓
    /api/ → gateway-pvvih:8080 (interne Docker)
```

**PAS DE `:8080` dans les URLs publiques !**

## 🔥 Redéploiement sur AWS

### Étape 1 : Push sur GitHub

```powershell
# Sur votre PC local
cd "C:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder"

git add .env a_user_front/src/assets/services/api.js
git commit -m "fix: correction URLs pour a-user-front avec nginx-https"
git push origin main
```

### Étape 2 : Redéployer sur le serveur AWS

```bash
# Connexion SSH
ssh ec2-user@100.48.20.109

# Aller dans le dossier
cd ~/deploiement_v2-crossborder

# Pull les changements
git pull

# Arrêter a-user-front
docker compose stop a-user-front

# Rebuilder SANS cache (IMPORTANT !)
docker compose build --no-cache a-user-front

# Redémarrer
docker compose up -d a-user-front

# Attendre 10 secondes
sleep 10

# Vérifier
docker ps | grep a-user-front
docker logs a-user-front --tail 30
```

### Étape 3 : Tester la connexion

#### Option 1 : Via nginx-https (Recommandé)
1. Ouvrez : `https://100.48.20.109/user/`
2. Cliquez sur "Se connecter"
3. Utilisez : `filoraliouine@gmail.com` / votre mot de passe
4. ✅ La connexion devrait fonctionner

#### Option 2 : Accès direct port 3003
1. Ouvrez : `http://100.48.20.109:3003`
2. ⚠️ HTTP uniquement (pas de HTTPS)
3. La connexion devrait aussi fonctionner

### Étape 4 : Vérifier dans la console du navigateur

Ouvrez F12 (DevTools) → Console, vous devriez voir :
```
✅ API configurée avec baseURL: https://100.48.20.109
✅ Connexion réussie
```

Et **PAS** :
```
❌ Tentative de connexion à http://100.48.20.109:8080
❌ Erreur réseau
```

## 🧪 Test manuel depuis le serveur

```bash
# Test de l'API auth via nginx-https
curl -X POST https://100.48.20.109/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"filoraliouine@gmail.com","password":"VOTRE_MOT_DE_PASSE"}' \
  -k

# Devrait retourner un token JWT
```

## 📊 Résumé des URLs correctes

| Service | URL Correcte | ❌ Ancienne URL incorrecte |
|---------|-------------|---------------------------|
| a-user-front (via nginx) | https://100.48.20.109/user/ | http://13.60.231.157:3003 |
| API Gateway (via nginx) | https://100.48.20.109/api/ | http://100.48.20.109:8080 |
| Login endpoint | https://100.48.20.109/api/user-auth/login | http://100.48.20.109:8080/api/user-auth/login |

## ⚠️ Points importants

### Pourquoi rebuilder sans cache ?

```bash
docker compose build --no-cache a-user-front
```

Les variables d'environnement React (`REACT_APP_*`) sont **compilées dans le bundle JavaScript au moment du build**. Si vous ne rebuilder pas, l'ancienne valeur reste dans le code compilé !

### Variables d'environnement React

**Build-time** (compilées dans le bundle) :
- `REACT_APP_GATEWAY_URL`
- `REACT_APP_API_URL`
- `REACT_APP_USER_API_URL`

**Runtime** (ne fonctionnent PAS avec React) :
- Variables dans `docker-compose.yml` → `environment:` section
- Ces variables sont ignorées par React après le build

### Architecture avec nginx-https

```
┌─────────────────────────────────────────┐
│ Navigateur                              │
│ https://100.48.20.109/user/             │
└────────────────┬────────────────────────┘
                 │ HTTPS (port 443)
                 ↓
┌─────────────────────────────────────────┐
│ nginx-https                             │
│ - Reçoit sur port 443                   │
│ - Route /user/ → a-user-front:80        │
│ - Route /api/ → gateway-pvvih:8080      │
└────────────────┬────────────────────────┘
                 │ HTTP interne Docker
                 ↓
┌─────────────────────────────────────────┐
│ a-user-front:80                         │
│ - Frontend React compilé                │
│ - Fait des appels à /api/*              │
└────────────────┬────────────────────────┘
                 │ Retour vers nginx
                 ↓
┌─────────────────────────────────────────┐
│ nginx-https → gateway-pvvih:8080        │
└─────────────────────────────────────────┘
```

## 🎯 Résultat attendu

Après redéploiement :

✅ Connexion fonctionne sur `https://100.48.20.109/user/`
✅ Pas d'erreur "Impossible de joindre le serveur"
✅ Le profil utilisateur s'affiche correctement
✅ Navigation entre les frontends fonctionne

## 📝 Checklist de vérification

- [ ] Git pull effectué sur le serveur
- [ ] a-user-front rebuilder avec `--no-cache`
- [ ] Conteneur redémarré avec `up -d`
- [ ] Logs vérifiés : `docker logs a-user-front`
- [ ] Test connexion sur `https://100.48.20.109/user/`
- [ ] Console navigateur sans erreurs réseau
- [ ] Profil utilisateur affiché correctement

## 🆘 En cas de problème

### Si l'erreur persiste après rebuild

1. Vérifier que les variables sont bien définies :
```bash
docker exec a-user-front env | grep REACT_APP
```

2. Vérifier le bundle JavaScript compilé :
```bash
docker exec a-user-front grep -r "100.48.20.109:8080" /usr/share/nginx/html/
```

Si vous trouvez encore `:8080`, c'est que le rebuild n'a pas été fait correctement.

3. Forcer la reconstruction complète :
```bash
docker compose rm -f a-user-front
docker rmi $(docker images | grep a-user-front | awk '{print $3}')
docker compose build --no-cache a-user-front
docker compose up -d a-user-front
```

### Si nginx ne route pas correctement

```bash
# Vérifier la config nginx
docker exec nginx-https cat /etc/nginx/conf.d/default.conf

# Recharger nginx
docker exec nginx-https nginx -s reload
```

---

## 📚 Fichiers modifiés

1. `.env` (racine) - URLs corrigées pour AWS + nginx-https
2. `a_user_front/src/assets/services/api.js` - Fallback URL corrigée
3. `docker-compose.yml` - Port 3003 exposé (déjà fait)

## 🚀 Prochaines étapes

Une fois la connexion fonctionnelle :
1. Tester la navigation entre les frontends
2. Vérifier que le profil utilisateur s'affiche (fix-profil-utilisateur.md)
3. Tester les fonctionnalités métier de chaque frontend
