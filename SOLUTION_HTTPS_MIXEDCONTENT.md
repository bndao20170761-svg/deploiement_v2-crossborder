# Solution au problème Mixed Content (HTTP vs HTTPS)

## ❌ PROBLÈME

Vous avez constaté que `http://100.48.20.109:8080/api/user-auth/login` fonctionne en HTTP direct.

Mais si vous configurez le frontend avec cette URL HTTP, **ça ne fonctionnera PAS** !

## 🔒 Pourquoi ?

**Mixed Content Policy** des navigateurs :
- Votre page est chargée en HTTPS : `https://100.48.20.109`
- Si le frontend essaie de faire une requête HTTP : `http://100.48.20.109:8080/api/...`
- Le navigateur **BLOQUE** automatiquement la requête avec une erreur :
  ```
  Mixed Content: The page at 'https://...' was loaded over HTTPS,
  but requested an insecure resource 'http://...'.
  This request has been blocked; the content must be served over HTTPS.
  ```

## ✅ SOLUTION

Utiliser **uniquement HTTPS** pour toutes les URLs dans les `.env` :

```env
# ✅ CORRECT (HTTPS via nginx-https)
REACT_APP_GATEWAY_URL=https://100.48.20.109
REACT_APP_USER_API_URL=https://100.48.20.109/api

# ❌ INCORRECT (Mixed Content bloqué par le navigateur)
REACT_APP_GATEWAY_URL=http://100.48.20.109:8080
REACT_APP_USER_API_URL=http://100.48.20.109:8080/api
```

## 🏗️ Architecture avec nginx-https

```
┌─────────────┐
│  Navigateur │
└──────┬──────┘
       │ HTTPS (port 443)
       │ https://100.48.20.109/api/user-auth/login
       ↓
┌─────────────────┐
│  nginx-https    │ Certificat SSL (déchiffrement)
│  (port 443)     │
└──────┬──────────┘
       │ HTTP (réseau Docker interne)
       │ http://gateway-pvvih:8080/api/user-auth/login
       ↓
┌─────────────────┐
│  Gateway PVVIH  │
│  (port 8080)    │
└──────┬──────────┘
       │ HTTP (réseau Docker interne)
       ↓
┌─────────────────┐
│  gestion-user   │
│  (port 8080)    │
└─────────────────┘
```

**Important** :
- Communication **externe** (navigateur ↔ nginx) : **HTTPS** obligatoire
- Communication **interne** (nginx ↔ gateway ↔ microservices) : **HTTP** OK (réseau Docker privé)

## 📝 Fichiers `.env` corrects

### a_reference_front/.env
```env
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyDOez4XWbw6IyAAngBCsKDJ-MlriBhH2IU
PORT=3001

# Gateway URLs - HTTPS via nginx-https
REACT_APP_GATEWAY_URL=https://100.48.20.109
REACT_APP_USER_API_URL=https://100.48.20.109/api
REACT_APP_REFERENCEMENT_API_URL=https://100.48.20.109/api
REACT_APP_PATIENT_API_URL=https://100.48.20.109/api
REACT_APP_FORUM_API_URL=https://100.48.20.109/api
REACT_APP_AUTH_API_URL=https://100.48.20.109/api

# Frontend URLs - HTTPS via nginx-https
REACT_APP_FORUM_URL=https://100.48.20.109/forum
REACT_APP_FRONTEND1_URL=https://100.48.20.109
REACT_APP_FRONTEND2_URL=https://100.48.20.109/user
```

### a_user_front/.env
```env
PORT=3002

# Gateway Configuration - HTTPS via nginx-https
REACT_APP_GATEWAY_URL=https://100.48.20.109
REACT_APP_USER_API_URL=https://100.48.20.109/api

# Other Frontend URLs - HTTPS via nginx-https
REACT_APP_FORUM_URL=https://100.48.20.109/forum
REACT_APP_FRONTEND2_URL=https://100.48.20.109
```

### gestion_forum_front/.env
```env
# Configuration de l'API Backend - HTTPS via nginx-https
REACT_APP_API_URL=https://100.48.20.109/api
REACT_APP_FORUM_API_URL=https://100.48.20.109/api
REACT_APP_AUTH_API_URL=https://100.48.20.109/api
REACT_APP_GATEWAY_URL=https://100.48.20.109

# Frontend URLs - HTTPS via nginx-https
REACT_APP_FRONTEND1_URL=https://100.48.20.109
REACT_APP_FRONTEND2_URL=https://100.48.20.109/user
```

## 🔧 Étapes pour appliquer la correction

### 1. Sur votre PC : Pousser les changements sur GitHub

```powershell
git add a_reference_front/.env a_user_front/.env gestion_forum_front/.env rebuild-frontends-https.sh SOLUTION_HTTPS_MIXEDCONTENT.md
git commit -m "fix: configuration HTTPS correcte dans tous les .env frontends"
git push origin main
```

### 2. Sur le serveur AWS (100.48.20.109)

```bash
# Pull les derniers changements
cd ~/deploiement_v2-crossborder
git pull

# Rendre le script exécutable
chmod +x rebuild-frontends-https.sh

# Exécuter le rebuild (prend 5-10 minutes)
./rebuild-frontends-https.sh
```

### 3. Vérification

Une fois le rebuild terminé :

1. Ouvrez `https://100.48.20.109/login`
2. Ouvrez la Console Développeur (F12)
3. Onglet "Network" ou "Réseau"
4. Essayez de vous connecter
5. Vérifiez que la requête va bien vers `https://100.48.20.109/api/user-auth/login` (HTTPS, pas HTTP)

Si tout est correct, vous ne devriez **PAS** voir d'erreur "Mixed Content" et la connexion devrait fonctionner !

## 🧪 Test de la géolocalisation

Une fois connecté avec succès :
1. Allez sur la page Cartographie
2. Cliquez sur "Géolocaliser"
3. Le navigateur devrait maintenant demander la permission GPS (car vous êtes en HTTPS)
4. Le marqueur bleu de votre position devrait apparaître sur la carte !

## 📞 En cas de problème

Si après le rebuild ça ne marche toujours pas :

### Vérifier les logs des frontends
```bash
docker logs a-reference-front --tail 50
```

### Vérifier que les .env sont bien dans l'image
```bash
# Vérifier dans a-reference-front
docker exec a-reference-front cat /app/.env

# Vérifier dans a-user-front
docker exec a-user-front cat /app/.env
```

### Vérifier les requêtes dans le navigateur
1. F12 → Console
2. Cherchez les erreurs "Mixed Content" ou "CORS"
3. F12 → Network → Filtrez "XHR"
4. Vérifiez que toutes les requêtes vont vers `https://100.48.20.109/api/...`

## 🎯 Points clés à retenir

1. **Jamais de HTTP depuis une page HTTPS** = Mixed Content bloqué
2. **nginx-https gère le SSL** pour tout le monde (frontends + API)
3. **Les microservices internes restent en HTTP** (réseau Docker privé)
4. **Rebuild obligatoire** après changement des `.env` (ils sont copiés dans l'image Docker)
