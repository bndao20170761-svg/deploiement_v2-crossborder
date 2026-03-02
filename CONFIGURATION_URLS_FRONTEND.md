# 🌐 Configuration des URLs Frontend

## 📋 Problème Résolu

Les frontends React sont construits avec des URLs en dur au moment du build. Pour AWS, nous devons utiliser l'IP publique au lieu de `localhost`.

## ✅ Solution Implémentée

Les Dockerfiles des frontends utilisent maintenant des **build arguments** pour injecter les URLs au moment de la construction des images Docker.

---

## 🔧 Configuration

### Pour le Développement Local

Dans votre fichier `.env`:

```bash
# URLs locales
PUBLIC_URL=http://localhost:8080
FORUM_URL=http://localhost:3001
FRONTEND1_URL=http://localhost:3002
FRONTEND2_URL=http://localhost:3003
```

### Pour AWS EC2

Dans votre fichier `.env` sur AWS:

```bash
# URLs publiques AWS (remplacez par votre IP)
PUBLIC_URL=http://16.171.1.67:8080
FORUM_URL=http://16.171.1.67:3001
FRONTEND1_URL=http://16.171.1.67:3002
FRONTEND2_URL=http://16.171.1.67:3003
```

---

## 📦 Comment ça Marche?

### 1. Dockerfiles Mis à Jour

Chaque Dockerfile frontend contient maintenant des `ARG` et `ENV`:

```dockerfile
# Build arguments
ARG REACT_APP_GATEWAY_URL=http://localhost:8080
ARG REACT_APP_FORUM_URL=http://localhost:3001

# Environment variables
ENV REACT_APP_GATEWAY_URL=$REACT_APP_GATEWAY_URL
ENV REACT_APP_FORUM_URL=$REACT_APP_FORUM_URL
```

### 2. Docker Compose Passe les Arguments

Le `docker-compose.yml` passe les valeurs du `.env`:

```yaml
gestion-forum-front:
  build:
    context: ./gestion_forum_front
    dockerfile: Dockerfile
    args:
      - REACT_APP_GATEWAY_URL=${PUBLIC_URL:-http://localhost:8080}
      - REACT_APP_FORUM_URL=${FORUM_URL:-http://localhost:3001}
```

### 3. React Utilise les Variables

Dans le code React, les variables sont accessibles via `process.env`:

```javascript
const API_URL = process.env.REACT_APP_GATEWAY_URL;
```

---

## 🚀 Déploiement

### Développement Local

```bash
# 1. Créer le .env
cp .env.example .env

# 2. Les URLs localhost sont déjà configurées par défaut
# Pas besoin de modifier

# 3. Build et démarrer
docker-compose up -d --build
```

### AWS EC2

```bash
# 1. Créer le .env
cp .env.aws.example .env

# 2. Modifier l'IP publique si nécessaire
nano .env
# Changez PUBLIC_IP=16.171.1.67 par votre vraie IP

# 3. Build et démarrer
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## 📊 Mapping des URLs

### Frontend Forum (Port 3001)

| Variable | Local | AWS |
|----------|-------|-----|
| REACT_APP_GATEWAY_URL | http://localhost:8080 | http://16.171.1.67:8080 |
| REACT_APP_FRONTEND1_URL | http://localhost:3002 | http://16.171.1.67:3002 |
| REACT_APP_FRONTEND2_URL | http://localhost:3003 | http://16.171.1.67:3003 |

### Frontend Reference (Port 3002)

| Variable | Local | AWS |
|----------|-------|-----|
| REACT_APP_GATEWAY_URL | http://localhost:8080 | http://16.171.1.67:8080 |
| REACT_APP_FORUM_URL | http://localhost:3001 | http://16.171.1.67:3001 |
| REACT_APP_FRONTEND2_URL | http://localhost:3003 | http://16.171.1.67:3003 |

### Frontend User (Port 3003)

| Variable | Local | AWS |
|----------|-------|-----|
| REACT_APP_GATEWAY_URL | http://localhost:8080 | http://16.171.1.67:8080 |
| REACT_APP_FORUM_URL | http://localhost:3001 | http://16.171.1.67:3001 |
| REACT_APP_FRONTEND2_URL | http://localhost:3002 | http://16.171.1.67:3002 |

---

## 🔍 Vérification

### Vérifier les URLs dans le Build

Après le build, vous pouvez vérifier les URLs utilisées:

```bash
# Inspecter l'image
docker inspect gestion-forum-front

# Voir les logs de build
docker-compose build gestion-forum-front
```

### Tester les URLs

```bash
# Depuis l'instance EC2
curl http://localhost:8080/actuator/health

# Depuis votre navigateur
http://16.171.1.67:3001  # Forum
http://16.171.1.67:3002  # Reference
http://16.171.1.67:3003  # User
```

---

## 🐛 Dépannage

### Problème: Frontend ne peut pas contacter le backend

**Cause:** URLs incorrectes dans le `.env`

**Solution:**
```bash
# Vérifier le .env
cat .env | grep PUBLIC_URL

# Doit afficher:
# PUBLIC_URL=http://16.171.1.67:8080  (pour AWS)
# ou
# PUBLIC_URL=http://localhost:8080    (pour local)
```

### Problème: Les URLs sont toujours en localhost après le build

**Cause:** Le `.env` n'a pas été lu ou les images n'ont pas été reconstruites

**Solution:**
```bash
# Reconstruire les images
docker-compose build --no-cache gestion-forum-front
docker-compose build --no-cache a-reference-front
docker-compose build --no-cache a-user-front

# Redémarrer
docker-compose up -d
```

### Problème: CORS errors

**Cause:** Le backend n'autorise pas les requêtes depuis l'IP publique

**Solution:** Vérifier la configuration CORS dans le Gateway (déjà configuré pour autoriser toutes les origines en développement)

---

## 📝 Fichiers Modifiés

### Dockerfiles
- ✅ `gestion_forum_front/Dockerfile` - Ajout des ARG et ENV
- ✅ `a_reference_front/Dockerfile` - Ajout des ARG et ENV
- ✅ `a_user_front/Dockerfile` - Ajout des ARG et ENV

### Docker Compose
- ✅ `docker-compose.yml` - Ajout des build args pour les frontends

### Configuration
- ✅ `.env.example` - Ajout des URLs pour local
- ✅ `.env.aws.example` - Ajout des URLs pour AWS

---

## ✅ Checklist de Vérification

Avant de pousser sur GitHub:

- [x] Dockerfiles mis à jour avec ARG et ENV
- [x] docker-compose.yml mis à jour avec build args
- [x] .env.example contient les URLs localhost
- [x] .env.aws.example contient les URLs AWS
- [x] Documentation créée (ce fichier)

Avant de déployer sur AWS:

- [ ] Fichier `.env` créé à partir de `.env.aws.example`
- [ ] IP publique correcte dans PUBLIC_URL
- [ ] Toutes les URLs pointent vers l'IP publique
- [ ] Images reconstruites avec `--build`

---

## 🎯 Résumé

**Avant:** Les frontends utilisaient `localhost` en dur ❌

**Maintenant:** Les frontends utilisent des variables d'environnement configurables ✅

**Résultat:** 
- Développement local: URLs localhost automatiques
- AWS EC2: URLs publiques configurées via `.env`
- Pas besoin de modifier le code source!

---

**Configuration terminée! 🎉**

Vous pouvez maintenant pousser sur GitHub et déployer sur AWS avec les bonnes URLs.
