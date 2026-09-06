# 🚨 PROBLÈME CRITIQUE : API Retourne HTML au lieu de JSON

## Symptômes

Quand vous accédez à `https://100.48.20.109/reference/` (a-reference-front), les APIs retournent du HTML au lieu de JSON :

```javascript
✅ patientService: Données patients: <!doctype html><html lang="en">...
✅ Hôpitaux du docteur chargés: <!doctype html><html lang="en">...
```

Erreur JavaScript :
```
Uncaught TypeError: r.filter is not a function
```

## Cause Racine

Le frontend **a-reference-front** fait des appels API qui atterrissent sur d'autres frontends au lieu du Gateway.

### Flux actuel (CASSÉ) :
```
Browser → https://100.48.20.109/reference/
  ↓
nginx-https:443 → a-reference-front:80
  ↓
a-reference-front fait: GET /api/patients
  ↓
nginx-https redirige vers: a-user-front:80  (HTML!)
  ↓
❌ Erreur: HTML reçu au lieu de JSON
```

## Diagnostic

### 1. Vérifier les URLs configurées dans a-reference-front

```bash
# Sur le serveur
docker exec a-reference-front env | grep REACT_APP
```

**Attendu** :
```
REACT_APP_GATEWAY_URL=https://100.48.20.109:8080
```

**Si vous voyez autre chose**, c'est le problème !

### 2. Test direct de l'API Gateway

```bash
# Depuis le serveur
curl -k https://localhost:8080/actuator/health
curl -k https://localhost:8080/api/patients/all
```

Devrait retourner du **JSON**, pas du HTML.

### 3. Vérifier la configuration nginx

```bash
docker exec nginx-https nginx -T | grep "location"
```

## Solutions

### Solution 1 : Corriger les Variables d'Environnement (RECOMMANDÉ)

Mettre à jour `.env` avec les bonnes URLs :

```bash
# Dans .env à la racine
REACT_APP_GATEWAY_URL=https://100.48.20.109:8080
REACT_APP_API_BASE_URL=https://100.48.20.109:8080
```

Puis rebuilder :

```bash
docker compose build --no-cache a-reference-front a-user-front gestion-forum-front
docker compose up -d
```

### Solution 2 : Vérifier le Dockerfile

Le Dockerfile doit utiliser les ARG/ENV correctement :

```dockerfile
ARG REACT_APP_GATEWAY_URL=https://100.48.20.109:8080
ENV REACT_APP_GATEWAY_URL=$REACT_APP_GATEWAY_URL
```

### Solution 3 : Corriger les Services Frontend

Dans `a_reference_front/src/services/`, vérifier que les URLs pointent vers :

```javascript
const API_BASE_URL = process.env.REACT_APP_GATEWAY_URL || 'https://100.48.20.109:8080';
```

## Commandes de Correction Rapide

```bash
# Sur le serveur GCP
cd ~/deploiement_v2-crossborder

# 1. Vérifier les variables
cat .env | grep REACT_APP

# 2. Vérifier la config des containers
docker inspect a-reference-front | grep -A 20 Env

# 3. Rebuilder avec les bonnes variables
docker compose build --no-cache \
  --build-arg REACT_APP_GATEWAY_URL=https://100.48.20.109:8080 \
  a-reference-front

# 4. Redémarrer
docker compose up -d a-reference-front

# 5. Vérifier les logs
docker logs a-reference-front --tail 50
```

## Test de Validation

### Depuis le navigateur (Console DevTools) :

1. Ouvrir `https://100.48.20.109:3001`
2. Ouvrir DevTools (F12) → Network
3. Filtrer par "XHR" ou "Fetch"
4. Vérifier les URLs appelées :

**✅ CORRECT** :
```
Request URL: https://100.48.20.109:8080/api/patients/all
Response: [{"id": 1, "nom": "..."}, ...]
```

**❌ INCORRECT** :
```
Request URL: https://100.48.20.109/api/patients
Response: <!doctype html>...
```

## Pourquoi ça arrive ?

1. **React Build Time** : Les variables d'environnement sont injectées au BUILD, pas au runtime
2. **Mauvaise Config** : Si `REACT_APP_GATEWAY_URL` n'est pas définie pendant le build
3. **Hardcoded URLs** : Le code source a des URLs hardcodées (localhost, etc.)

## Fichiers à Vérifier

```bash
# 1. Variables d'environnement
cat .env
cat a_reference_front/.env

# 2. Dockerfile
cat a_reference_front/Dockerfile | grep REACT_APP

# 3. Services JS
cat a_reference_front/src/services/api.js
cat a_reference_front/src/services/patientService.js
cat a_reference_front/src/services/hopitalService.js
```

## URLs Correctes à Utiliser

| Service | URL | Protocole |
|---------|-----|-----------|
| **API Gateway** | `https://100.48.20.109:8080` | HTTPS |
| **a-reference-front** | `https://100.48.20.109:3001` | HTTPS |
| **gestion-forum-front** | `https://100.48.20.109:3002` | HTTPS |
| **a-user-front** | `https://100.48.20.109:3003` | HTTPS |

## Script de Diagnostic Automatique

Créé dans `DIAGNOSTIC_API_HTML.sh` - exécutez-le pour identifier le problème exact.

---

**Dernière mise à jour** : 6 septembre 2026  
**Statut** : EN ATTENTE DE CORRECTION
