# Vérification et Corrections des 3 Frontends

## ✅ Corrections effectuées

### 1. a_reference_front
**Problèmes corrigés :**
- ✅ `src/services/httpClient.js` - Port 8081 → 8080
- ✅ `src/services/apiService.js` - Port 8081 → 8080  
- ✅ `src/components/referenceService.js` - Port 8081 → 8080
- ✅ `.env` - Déjà correct (8080)

**Fichiers restants avec 8081 (à corriger par script) :**
- `src/components/DossierViewEnhanced.js`
- `src/components/ReferenceWizard.js` (2 occurrences)
- `src/components/PatientView.js`
- `src/components/HopitalMap.js` (2 occurrences)
- `src/components/HopitalList.js`
- `src/components/FormulaireMultiEtapes.js`
- `src/components/Header.js`
- `src/components/FormulaireCompletFusionne.js`
- `src/components/DossierView.js`
- `src/components/AdvancedSearch.js` (2 occurrences)

### 2. a_user_front
**Problèmes corrigés :**
- ✅ `src/assets/components/Login.js` - Port 8081 → 8080
- ✅ `src/assets/components/Header.js` - Port 8081 → 8080
- ✅ `src/assets/components/HospitalForm.js` - Port 8081 → 8080
- ✅ `src/config/microservices.js` - Ports 8081 → 8080
- ✅ `.env` - Déjà correct (8080)

**Fichiers restants avec 8081 (à corriger par script) :**
- `src/assets/components/CartographyMap.js` (3 occurrences)

### 3. gestion_forum_front
**Problèmes corrigés :**
- ✅ `src/services/api.js` - AUTH_API_URL: Port 9089 → 8080
- ✅ `src/services/api.js` - Duplication `/api/api/translations` → `/api/translations`
- ✅ `.env` - Ajout des variables manquantes

**État :**
- ✅ Tous les fichiers utilisent déjà le port 8080
- ✅ Pas de fichiers hardcodés avec 8081
- ✅ Configuration complète

## 📋 Script de correction automatique

Pour corriger TOUS les fichiers restants avec 8081 :

```powershell
powershell -ExecutionPolicy Bypass -File .\fix-all-ports.ps1
```

Ce script va :
- Parcourir les 3 frontends
- Remplacer tous les `localhost:8081` par `localhost:8080`
- Afficher un rapport des fichiers modifiés

## 🚀 Commandes de redéploiement

### Option 1 : Redéployer les 3 frontends ensemble

```bash
# 1. Arrêter
docker-compose stop a-reference-front a-user-front gestion-forum-front

# 2. Reconstruire sans cache
docker-compose build a-reference-front a-user-front gestion-forum-front --no-cache

# 3. Redémarrer
docker-compose up -d a-reference-front a-user-front gestion-forum-front

# 4. Vérifier les logs
docker-compose logs -f a-reference-front a-user-front gestion-forum-front
```

### Option 2 : Redéployer un par un

```bash
# a_reference_front
docker-compose stop a-reference-front
docker-compose build a-reference-front --no-cache
docker-compose up -d a-reference-front

# a_user_front
docker-compose stop a-user-front
docker-compose build a-user-front --no-cache
docker-compose up -d a-user-front

# gestion_forum_front
docker-compose stop gestion-forum-front
docker-compose build gestion-forum-front --no-cache
docker-compose up -d gestion-forum-front
```

## 🧪 Tests après redéploiement

### 1. Test d'authentification (via Gateway)

**Register** :
```http
POST http://localhost:8080/api/user-auth/register
Content-Type: application/json

{
  "username": "test@example.com",
  "password": "password123",
  "nom": "Test",
  "prenom": "User",
  "profil": "USER",
  "nationalite": "SN",
  "actif": true
}
```

**Login** :
```http
POST http://localhost:8080/api/user-auth/login
Content-Type: application/json

{
  "username": "babacarndao1011@gmail.com",
  "password": "passe123"
}
```

**Me** (avec token) :
```http
GET http://localhost:8080/api/user-auth/me
Authorization: Bearer <votre_token>
```

### 2. Test des frontends

- **gestion_forum_front** : http://localhost:3001
- **a_reference_front** : http://localhost:3002  
- **a_user_front** : http://localhost:3003

Vérifier que :
- Le login fonctionne
- Les appels API passent par le Gateway (port 8080)
- Pas d'erreurs 404 ou CORS dans la console

## 📊 Résumé des configurations

### Ports utilisés :
- **Gateway** : 8080 ✅
- **Eureka** : 8761 ✅
- **Config Server** : 8888 ✅
- **Forum Frontend** : 3001 ✅
- **Reference Frontend** : 3002 ✅
- **User Frontend** : 3003 ✅

### Routes Gateway pour authentification :
- `/api/user-auth/login` → `gestion-user:8080/api/auth/login`
- `/api/user-auth/register` → `gestion-user:8080/api/auth/register`
- `/api/user-auth/me` → `gestion-user:8080/api/auth/me`
- `/api/auth/login` → `gestion-user:8080/api/auth/login` (direct)
- `/api/auth/register` → `gestion-user:8080/api/auth/register` (direct)

### Variables d'environnement (.env) :

**a_reference_front** :
```env
REACT_APP_GATEWAY_URL=http://localhost:8080
REACT_APP_USER_API_URL=http://localhost:8080/api
```

**a_user_front** :
```env
REACT_APP_GATEWAY_URL=http://localhost:8080
REACT_APP_USER_API_URL=http://localhost:8080/api
```

**gestion_forum_front** :
```env
REACT_APP_GATEWAY_URL=http://localhost:8080
REACT_APP_FORUM_API_URL=http://localhost:8080/api
REACT_APP_AUTH_API_URL=http://localhost:8080/api
```

## ⚠️ Points d'attention

1. **Pas de duplication /api/api** : Les services ajoutent déjà `/api` dans les URLs
2. **Tous les appels passent par le Gateway** : Port 8080 uniquement
3. **Les .env sont corrects** : Pas besoin de les modifier
4. **Le problème était dans le code hardcodé** : Fallbacks avec `|| 'http://localhost:8081'`

## ✨ Prochaines étapes

1. ✅ Exécuter le script de correction : `.\fix-all-ports.ps1`
2. ✅ Redéployer les 3 frontends
3. ✅ Tester le login/register via Postman
4. ✅ Tester les frontends dans le navigateur
5. ✅ Vérifier les logs pour confirmer qu'il n'y a plus d'erreurs
