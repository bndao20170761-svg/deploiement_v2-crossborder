# Communication Frontend-Backend dans Docker

## 🎯 Principe fondamental

### Frontend (JavaScript dans le navigateur)
- ✅ **DOIT** utiliser `localhost` avec les ports EXTERNES
- ❌ **NE PEUT PAS** utiliser les noms de services Docker
- **Raison**: Le navigateur s'exécute sur la machine du client, en dehors de Docker

### Backend (Java dans Docker)
- ✅ **DOIT** utiliser les noms de services Docker
- ❌ **NE DOIT PAS** utiliser `localhost`
- **Raison**: Les services backend s'exécutent dans des conteneurs Docker séparés

## 📊 Architecture de communication

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigateur (Client)                       │
│                  Machine de l'utilisateur                    │
│                                                               │
│  Accès via:                                                  │
│  - http://localhost:3001 (Forum Frontend)                   │
│  - http://localhost:3002 (Reference Frontend)               │
│  - http://localhost:3003 (User Frontend)                    │
│  - http://localhost:8080 (API Gateway)                      │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Réseau Docker: pvvih-network                │
│                                                               │
│  ┌──────────────── Frontends (Nginx) ────────────────┐      │
│  │  gestion-forum-front:80 → Port externe 3001       │      │
│  │  a-reference-front:80 → Port externe 3002         │      │
│  │  a-user-front:80 → Port externe 3003              │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  ┌──────────────── Gateway ─────────────────┐               │
│  │  gateway-pvvih:8080 → Port externe 8080  │               │
│  └───────────────┬───────────────────────────┘               │
│                  │                                            │
│         ┌────────┴────────┬──────────┬──────────┐           │
│         ▼                 ▼          ▼          ▼           │
│  ┌─────────┐      ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ forum-  │      │gestion- │  │gestion- │  │gestion- │   │
│  │ pvvih   │      │ user    │  │reference│  │ patient │   │
│  │ :8080   │      │ :8080   │  │ :8080   │  │ :8080   │   │
│  └────┬────┘      └────┬────┘  └────┬────┘  └────┬────┘   │
│       │                │            │            │           │
│       ▼                ▼            ▼            ▼           │
│  ┌─────────┐      ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │mongodb  │      │mysql-   │  │mysql-   │  │mysql-   │   │
│  │ :27017  │      │user     │  │reference│  │patient  │   │
│  │         │      │ :3306   │  │ :3306   │  │ :3306   │   │
│  └─────────┘      └─────────┘  └─────────┘  └─────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration Frontend

### Variables d'environnement dans docker-compose.yml

Les frontends reçoivent ces variables au moment du BUILD:

```yaml
# gestion-forum-front
environment:
  - REACT_APP_FORUM_API_URL=http://localhost:8080/api
  - REACT_APP_AUTH_API_URL=http://localhost:8080/api
  - REACT_APP_GATEWAY_URL=http://localhost:8080
  - REACT_APP_FRONTEND1_URL=http://localhost:3002
  - REACT_APP_FRONTEND2_URL=http://localhost:3003

# a-reference-front
environment:
  - REACT_APP_API_URL=http://localhost:8080
  - REACT_APP_GATEWAY_URL=http://localhost:8080
  - REACT_APP_FORUM_URL=http://localhost:3001
  - REACT_APP_FRONTEND2_URL=http://localhost:3003

# a-user-front
environment:
  - REACT_APP_API_URL=http://localhost:8080
  - REACT_APP_GATEWAY_URL=http://localhost:8080
  - REACT_APP_USER_API_URL=http://localhost:8080/api
  - REACT_APP_FORUM_URL=http://localhost:3001
  - REACT_APP_FRONTEND1_URL=http://localhost:3002
```

### Fichiers de configuration créés

Chaque frontend a maintenant un fichier `src/config/api.js`:

**gestion_forum_front/src/config/api.js:**
```javascript
export const API_CONFIG = {
  FORUM_API_URL: process.env.REACT_APP_FORUM_API_URL || 'http://localhost:8080/api',
  AUTH_API_URL: process.env.REACT_APP_AUTH_API_URL || 'http://localhost:8080/api',
  GATEWAY_URL: process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080',
  FRONTEND1_URL: process.env.REACT_APP_FRONTEND1_URL || 'http://localhost:3002',
  FRONTEND2_URL: process.env.REACT_APP_FRONTEND2_URL || 'http://localhost:3003',
};
```

**a_reference_front/src/config/api.js:**
```javascript
export const API_CONFIG = {
  GATEWAY_URL: process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  FORUM_URL: process.env.REACT_APP_FORUM_URL || 'http://localhost:3001',
  FRONTEND2_URL: process.env.REACT_APP_FRONTEND2_URL || 'http://localhost:3003',
};
```

**a_user_front/src/config/api.js:**
```javascript
export const API_CONFIG = {
  GATEWAY_URL: process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8080',
  USER_API_URL: process.env.REACT_APP_USER_API_URL || 'http://localhost:8080/api',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  FORUM_URL: process.env.REACT_APP_FORUM_URL || 'http://localhost:3001',
  FRONTEND1_URL: process.env.REACT_APP_FRONTEND1_URL || 'http://localhost:3002',
};
```

## 🔧 Configuration Backend

### Noms de services Docker

Les backends utilisent les noms de services Docker pour communiquer:

```java
// Gateway → Backends
http://forum-pvvih:8080
http://gestion-user:8080
http://gestion-reference:8080
http://gestion-patient:8080

// Backends → Bases de données
mongodb://admin:password@mongodb:27017/forum_db
jdbc:mysql://mysql-user:3306/user_db
jdbc:mysql://mysql-reference:3306/reference_db
jdbc:mysql://mysql-patient:3306/patient_db

// Backends → Eureka
http://api-register:8761/eureka/

// Backends → Config Server
http://api-configuration:8888
```

### Fichiers modifiés

**Clients Feign:**
```java
@FeignClient(
    name = "gestion-user",
    url = "${feign.user-service.url:http://gestion-user:8080}",
    configuration = FeignClientConfig.class
)
```

**ProxyController:**
```java
String url = "http://forum-pvvih:8080/api/sujets";
```

**application.yaml (Gateway):**
```yaml
routes:
  - id: user-api
    uri: http://gestion-user:8080
  - id: forum-api
    uri: http://forum-pvvih:8080
  - id: reference-api
    uri: http://gestion-reference:8080
  - id: patient-api
    uri: http://gestion-patient:8080
```

## 📝 Configuration CORS

Les backends acceptent les requêtes depuis:

### 1. Navigateur (externe à Docker)
```java
"http://localhost:3000",
"http://localhost:3001",
"http://localhost:3002",
"http://localhost:3003",
"http://localhost:8080",
"http://localhost:8081",
"http://127.0.0.1:3000",
"http://127.0.0.1:3001",
"http://127.0.0.1:3002"
```

### 2. Communication interne Docker
```java
"http://gateway-pvvih:8080",
"http://gestion-forum-front",
"http://a-reference-front",
"http://a-user-front"
```

**Note**: Les noms de services Docker dans CORS sont pour les cas où un service backend ferait une requête HTTP directe à un autre service (rare, mais possible).

## 🎯 Mapping des ports

| Service | Nom Docker | Port interne | Port externe | Accès depuis navigateur |
|---------|------------|--------------|--------------|-------------------------|
| Forum Frontend | gestion-forum-front | 80 | 3001 | http://localhost:3001 |
| Reference Frontend | a-reference-front | 80 | 3002 | http://localhost:3002 |
| User Frontend | a-user-front | 80 | 3003 | http://localhost:3003 |
| API Gateway | gateway-pvvih | 8080 | 8080 | http://localhost:8080 |
| Forum Service | forum-pvvih | 8080 | 9092 | Via Gateway uniquement |
| User Service | gestion-user | 8080 | 9089 | Via Gateway uniquement |
| Reference Service | gestion-reference | 8080 | 9090 | Via Gateway uniquement |
| Patient Service | gestion-patient | 8080 | 9091 | Via Gateway uniquement |
| Eureka | api-register | 8761 | 8761 | http://localhost:8761 |
| Config Server | api-configuration | 8888 | 8888 | http://localhost:8888 |

## ✅ Règles de communication

### Frontend → Backend
```
Navigateur → http://localhost:8080/api/users
           ↓
    Gateway (port externe 8080)
           ↓
    gateway-pvvih:8080 (interne Docker)
           ↓
    gestion-user:8080 (interne Docker)
```

### Backend → Backend
```
gestion-reference → http://gestion-user:8080/api/users
                  ↓
            gestion-user:8080 (interne Docker)
```

### Backend → Base de données
```
gestion-user → jdbc:mysql://mysql-user:3306/user_db
             ↓
        mysql-user:3306 (interne Docker)
```

## 🚫 Erreurs courantes

### ❌ Frontend utilisant un nom de service Docker
```javascript
// INCORRECT - Ne fonctionnera PAS
const response = await fetch('http://gateway-pvvih:8080/api/users');
```

**Erreur**: Le navigateur ne peut pas résoudre `gateway-pvvih` car ce nom n'existe que dans le réseau Docker.

**Solution**:
```javascript
// CORRECT
const response = await fetch('http://localhost:8080/api/users');
```

### ❌ Backend utilisant localhost
```java
// INCORRECT - Ne fonctionnera PAS dans Docker
@FeignClient(name = "user-service", url = "http://localhost:9089")
```

**Erreur**: `localhost` dans un conteneur Docker fait référence au conteneur lui-même, pas à un autre service.

**Solution**:
```java
// CORRECT
@FeignClient(name = "user-service", url = "http://gestion-user:8080")
```

## 📚 Fichiers de référence

### Frontend
- `gestion_forum_front/src/config/api.js` - Configuration centralisée
- `gestion_forum_front/src/services/api.js` - Service API
- `docker-compose.yml` - Variables d'environnement

### Backend
- `*/src/main/resources/application.properties` - Configuration DB
- `*/src/main/resources/bootstrap.properties` - Configuration Eureka/Config
- `*/src/main/resources/feign.properties` - Configuration Feign
- `*/src/main/java/*/config/SecurityConfig.java` - Configuration CORS
- `Getway_PVVIH/src/main/resources/application.yaml` - Routes Gateway

## 🔍 Vérification

### 1. Vérifier les variables d'environnement des frontends

```powershell
# Vérifier les variables d'un frontend
docker-compose exec gestion-forum-front env | findstr REACT_APP
```

### 2. Vérifier la configuration backend

```powershell
# Vérifier la configuration d'un backend
docker-compose exec gestion-user env | findstr DATASOURCE
docker-compose exec gestion-user env | findstr EUREKA
```

### 3. Tester la communication

```powershell
# Depuis un backend vers un autre
docker-compose exec gestion-user curl http://forum-pvvih:8080/actuator/health

# Depuis le navigateur
curl http://localhost:8080/actuator/health
```

## 🎯 Résumé

| Contexte | Utiliser | Exemple |
|----------|----------|---------|
| Frontend (JavaScript) | localhost + port externe | http://localhost:8080 |
| Backend → Backend | Nom service Docker + port interne | http://gestion-user:8080 |
| Backend → DB | Nom service Docker + port interne | jdbc:mysql://mysql-user:3306/db |
| Backend → Eureka | Nom service Docker + port interne | http://api-register:8761/eureka/ |
| Navigateur → Service | localhost + port externe | http://localhost:3001 |

---

**Important**: Les frontends React sont compilés en fichiers statiques HTML/JS/CSS qui s'exécutent dans le navigateur du client. Ils ne peuvent PAS utiliser les noms de services Docker!
