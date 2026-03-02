# 🔐 Configuration de Sécurité CORS

## ✅ Modifications Effectuées

J'ai mis à jour la configuration CORS de tous les microservices pour utiliser des variables d'environnement au lieu d'URLs en dur.

---

## 📋 Fichiers Modifiés

### Backend Services (SecurityConfig.java)

1. ✅ **Getway_PVVIH** - Gateway principal
2. ✅ **gestion_user** - Service d'authentification
3. ✅ **gestion_reference** - Service de référence
4. ✅ **gestion_patient** - Service patient
5. ✅ **Forum_PVVIH** - Service forum

### Configuration Docker

6. ✅ **docker-compose.yml** - Ajout de CORS_ALLOWED_ORIGINS pour tous les services backend
7. ✅ **.env.example** - Configuration CORS pour développement local
8. ✅ **.env.aws.example** - Configuration CORS pour AWS EC2
9. ✅ **deploy-aws-simple.sh** - Configuration automatique de CORS_ALLOWED_ORIGINS

---

## 🔧 Comment ça Marche?

### 1. Code Java (SecurityConfig)

Chaque microservice lit maintenant la variable d'environnement `CORS_ALLOWED_ORIGINS`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Récupérer les origines autorisées depuis les variables d'environnement
    String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");
    
    List<String> allowedOrigins;
    if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
        // Utiliser les origines depuis l'environnement (production)
        allowedOrigins = Arrays.asList(allowedOriginsEnv.split(","));
    } else {
        // Origines par défaut pour le développement local
        allowedOrigins = Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "http://localhost:3003",
                // ... autres origines localhost
        );
    }
    
    configuration.setAllowedOrigins(allowedOrigins);
    // ... reste de la configuration
}
```

### 2. Docker Compose

Chaque service backend reçoit la variable `CORS_ALLOWED_ORIGINS`:

```yaml
gestion-user:
  environment:
    - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003}
```

### 3. Fichier .env

**Développement Local (.env.example):**
```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002,http://127.0.0.1:3003
```

**AWS EC2 (.env.aws.example):**
```bash
CORS_ALLOWED_ORIGINS=http://16.171.1.67:3000,http://16.171.1.67:3001,http://16.171.1.67:3002,http://16.171.1.67:3003,http://16.171.1.67:8080
```

---

## 🌐 Origines Autorisées

### Développement Local

| Service | Port | URL Autorisée |
|---------|------|---------------|
| Frontend Forum | 3001 | http://localhost:3001 |
| Frontend Reference | 3002 | http://localhost:3002 |
| Frontend User | 3003 | http://localhost:3003 |
| Gateway | 8080 | http://localhost:8080 |

**+ Variantes avec 127.0.0.1**

---

### AWS EC2 (IP: 16.171.1.67)

| Service | Port | URL Autorisée |
|---------|------|---------------|
| Frontend Forum | 3001 | http://16.171.1.67:3001 |
| Frontend Reference | 3002 | http://16.171.1.67:3002 |
| Frontend User | 3003 | http://16.171.1.67:3003 |
| Gateway | 8080 | http://16.171.1.67:8080 |

---

## 🔄 Flux de Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                    Fichier .env                             │
│  CORS_ALLOWED_ORIGINS=http://16.171.1.67:3001,...          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Docker Compose lit le .env                     │
│  environment:                                                │
│    - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Container reçoit la variable d'environnement        │
│  CORS_ALLOWED_ORIGINS=http://16.171.1.67:3001,...          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Spring Boot lit System.getenv()                     │
│  String allowedOriginsEnv = System.getenv("CORS_...")       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│      Configuration CORS appliquée avec les bonnes URLs ✅   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Tests de Vérification

### Test 1: Vérifier la Configuration Locale

```bash
# Créer .env
cp .env.example .env

# Vérifier CORS_ALLOWED_ORIGINS
cat .env | grep CORS_ALLOWED_ORIGINS

# Doit afficher:
# CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,...
```

### Test 2: Vérifier la Configuration AWS

```bash
# Créer .env
cp .env.aws.example .env

# Vérifier CORS_ALLOWED_ORIGINS
cat .env | grep CORS_ALLOWED_ORIGINS

# Doit afficher:
# CORS_ALLOWED_ORIGINS=http://16.171.1.67:3000,http://16.171.1.67:3001,...
```

### Test 3: Tester CORS depuis le Navigateur

Ouvrez la console du navigateur (F12) et vérifiez qu'il n'y a pas d'erreurs CORS:

```
❌ Avant: Access to XMLHttpRequest at 'http://16.171.1.67:8080/api/...' from origin 'http://16.171.1.67:3001' has been blocked by CORS policy

✅ Après: Pas d'erreur CORS
```

---

## 📊 Comparaison Avant/Après

### ❌ Avant

**Problème:** URLs CORS en dur dans le code Java

```java
configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "http://localhost:3001",
        // ... URLs en dur
));
```

**Conséquences:**
- ❌ Impossible d'utiliser l'IP publique AWS
- ❌ Erreurs CORS en production
- ❌ Besoin de modifier le code pour chaque environnement

---

### ✅ Après

**Solution:** URLs CORS configurables via variable d'environnement

```java
String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");
if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
    allowedOrigins = Arrays.asList(allowedOriginsEnv.split(","));
}
```

**Avantages:**
- ✅ Configuration via `.env`
- ✅ Fonctionne en local et sur AWS
- ✅ Pas de modification de code nécessaire
- ✅ Sécurité maintenue

---

## 🔐 Sécurité

### Origines Autorisées

**Développement Local:**
- ✅ localhost:3000-3003
- ✅ 127.0.0.1:3000-3003
- ✅ Containers Docker internes

**AWS EC2:**
- ✅ 16.171.1.67:3000-3003
- ✅ 16.171.1.67:8080
- ✅ Containers Docker internes

### Méthodes HTTP Autorisées

- GET
- POST
- PUT
- DELETE
- OPTIONS (preflight)
- PATCH

### Headers Autorisés

- Authorization (pour JWT)
- Content-Type
- Accept
- Origin
- X-Requested-With
- Access-Control-Request-Method
- Access-Control-Request-Headers

### Credentials

- `allowCredentials: true` - Permet l'envoi de cookies et headers d'authentification

---

## 🚀 Déploiement

### Développement Local

```bash
# 1. Créer .env
cp .env.example .env

# 2. Vérifier CORS_ALLOWED_ORIGINS
cat .env | grep CORS

# 3. Démarrer
docker-compose up -d --build
```

**CORS configuré automatiquement pour localhost**

---

### AWS EC2

```bash
# 1. Créer .env
cp .env.aws.example .env

# 2. Déployer (configure CORS automatiquement)
bash deploy-aws-simple.sh
```

**Le script configure automatiquement:**
- PUBLIC_IP
- PUBLIC_URL, FORUM_URL, etc.
- **CORS_ALLOWED_ORIGINS** avec l'IP publique

---

## 🐛 Dépannage

### Problème: Erreur CORS en production

**Symptôme:**
```
Access to XMLHttpRequest at 'http://16.171.1.67:8080/api/...' from origin 'http://16.171.1.67:3001' has been blocked by CORS policy
```

**Solution:**
```bash
# 1. Vérifier CORS_ALLOWED_ORIGINS dans .env
cat .env | grep CORS_ALLOWED_ORIGINS

# 2. Doit contenir l'IP publique
# CORS_ALLOWED_ORIGINS=http://16.171.1.67:3001,...

# 3. Si manquant, ajouter:
echo "CORS_ALLOWED_ORIGINS=http://16.171.1.67:3000,http://16.171.1.67:3001,http://16.171.1.67:3002,http://16.171.1.67:3003,http://16.171.1.67:8080" >> .env

# 4. Redémarrer les services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

---

### Problème: CORS fonctionne en local mais pas sur AWS

**Cause:** CORS_ALLOWED_ORIGINS contient localhost au lieu de l'IP publique

**Solution:**
```bash
# Vérifier le .env
cat .env | grep CORS_ALLOWED_ORIGINS

# Doit contenir 16.171.1.67, pas localhost
# Si incorrect, corriger:
nano .env
# Changez localhost par 16.171.1.67

# Redémarrer
docker-compose restart
```

---

### Problème: Preflight OPTIONS échoue

**Symptôme:**
```
OPTIONS request failed
```

**Vérification:**
```bash
# Tester OPTIONS
curl -X OPTIONS http://16.171.1.67:8080/api/user-auth/login \
  -H "Origin: http://16.171.1.67:3001" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Doit retourner 200 avec headers CORS
```

**Solution:** Vérifier que OPTIONS est autorisé dans SecurityConfig (déjà configuré)

---

## ✅ Checklist de Sécurité

### Configuration CORS

- [x] SecurityConfig mis à jour dans tous les microservices
- [x] Variable CORS_ALLOWED_ORIGINS utilisée
- [x] Fallback localhost pour développement
- [x] docker-compose.yml mis à jour
- [x] .env.example configuré
- [x] .env.aws.example configuré
- [x] Script deploy-aws-simple.sh mis à jour

### Origines Autorisées

- [x] Frontends (ports 3001-3003)
- [x] Gateway (port 8080)
- [x] Localhost pour développement
- [x] IP publique AWS pour production

### Méthodes et Headers

- [x] GET, POST, PUT, DELETE, OPTIONS, PATCH autorisés
- [x] Authorization header autorisé (JWT)
- [x] Content-Type autorisé
- [x] Credentials autorisés

---

## 📚 Références

- **Spring CORS Documentation:** https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-cors
- **MDN CORS:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Spring Security CORS:** https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html

---

## 🎯 Résumé

**Avant:** URLs CORS en dur → Erreurs en production ❌

**Maintenant:** URLs CORS configurables via .env → Fonctionne partout ✅

**Configuration:**
- **Local:** `CORS_ALLOWED_ORIGINS=http://localhost:3001,...`
- **AWS:** `CORS_ALLOWED_ORIGINS=http://16.171.1.67:3001,...`

**Déploiement:** Le script configure automatiquement CORS_ALLOWED_ORIGINS avec l'IP publique!

---

**Configuration de sécurité CORS terminée! 🔐✅**
