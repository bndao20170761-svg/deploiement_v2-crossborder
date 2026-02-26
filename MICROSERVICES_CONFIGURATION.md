# Configuration Microservices - Architecture Docker

## ✅ Changements effectués pour l'architecture microservices

### Principe fondamental
Dans une architecture microservices avec Docker, **chaque service est dans son propre conteneur** (comme une machine distante). Les services ne peuvent PAS communiquer via `localhost` mais doivent utiliser les **noms de services Docker**.

## 🗄️ Bases de données configurées

### MongoDB (Forum Service)
- **Service**: `mongodb`
- **Port externe**: 27017
- **Base de données**: `forum_db`
- **Utilisateur**: `admin`
- **Connexion depuis Forum_PVVIH**: `mongodb://admin:password@mongodb:27017/forum_db`

### MySQL User Service
- **Service**: `mysql-user`
- **Port externe**: 3307
- **Base de données**: `user_db`
- **Utilisateur**: `user_service`
- **Connexion depuis gestion_user**: `jdbc:mysql://mysql-user:3306/user_db`

### MySQL Reference Service
- **Service**: `mysql-reference`
- **Port externe**: 3308
- **Base de données**: `reference_db`
- **Utilisateur**: `reference_service`
- **Connexion depuis gestion_reference**: `jdbc:mysql://mysql-reference:3306/reference_db`

### MySQL Patient Service
- **Service**: `mysql-patient`
- **Port externe**: 3309
- **Base de données**: `patient_db`
- **Utilisateur**: `patient_service`
- **Connexion depuis gestion_patient**: `jdbc:mysql://mysql-patient:3306/patient_db`

## 🔄 Services et leurs noms Docker

| Service | Nom Docker | Port interne | Port externe | Base de données |
|---------|------------|--------------|--------------|-----------------|
| API Gateway | `gateway-pvvih` | 8080 | 8080 | - |
| Service Registry | `api-register` | 8761 | 8761 | - |
| Config Server | `api-configuration` | 8888 | 8888 | - |
| Forum Service | `forum-pvvih` | 8080 | 9092 | MongoDB |
| User Service | `gestion-user` | 8080 | 9089 | MySQL |
| Reference Service | `gestion-reference` | 8080 | 9090 | MySQL |
| Patient Service | `gestion-patient` | 8080 | 9091 | MySQL |
| Forum Frontend | `gestion-forum-front` | 80 | 3001 | - |
| Reference Frontend | `a-reference-front` | 80 | 3002 | - |
| User Frontend | `a-user-front` | 80 | 3003 | - |

## 📝 Fichiers modifiés

### 1. docker-compose.yml
- ✅ Ajout des services de bases de données (MongoDB + 3 MySQL)
- ✅ Configuration des connexions avec noms de services
- ✅ Mise à jour des variables d'environnement
- ✅ Ajout des dépendances vers les bases de données
- ✅ Configuration des ports externes pour chaque service

### 2. Gateway (Getway_PVVIH/src/main/resources/application.yaml)
**Changements:**
```yaml
# AVANT
uri: http://localhost:9089  # ❌ Ne fonctionne pas dans Docker

# APRÈS
uri: http://gestion-user:8080  # ✅ Utilise le nom du service Docker
```

**Routes mises à jour:**
- `user-api-*` → `http://gestion-user:8080`
- `patient-pvvih` → `http://gestion-patient:8080`
- `forum-pvvih` → `http://forum-pvvih:8080`
- `referencement-pvvih` → `http://gestion-reference:8080`

**Eureka:**
```yaml
# AVANT
defaultZone: http://localhost:8761/eureka/  # ❌

# APRÈS
defaultZone: http://api-register:8761/eureka/  # ✅
```

### 3. Backend Services - bootstrap.properties

#### gestion_user/src/main/resources/bootstrap.properties
```properties
# AVANT
spring.config.import=configserver:http://localhost:8880  # ❌
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/  # ❌

# APRÈS
spring.config.import=configserver:http://api-configuration:8888  # ✅
eureka.client.service-url.defaultZone=http://api-register:8761/eureka/  # ✅
```

#### gestion_reference/src/main/resources/bootstrap.properties
```properties
# AVANT
spring.config.import=configserver:http://localhost:8880  # ❌
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/  # ❌

# APRÈS
spring.config.import=configserver:http://api-configuration:8888  # ✅
eureka.client.service-url.defaultZone=http://api-register:8761/eureka/  # ✅
```

### 4. Backend Services - application.properties

#### gestion_user/src/main/resources/application.properties
```properties
# AVANT
spring.datasource.url=jdbc:mysql://localhost:3306/user_db  # ❌
spring.datasource.username=root

# APRÈS
spring.datasource.url=jdbc:mysql://mysql-user:3306/user_db  # ✅
spring.datasource.username=user_service
```

#### gestion_reference/src/main/resources/application.properties
```properties
# AVANT
spring.datasource.url=jdbc:mysql://localhost:3306/reference_db  # ❌
spring.datasource.username=root

# APRÈS
spring.datasource.url=jdbc:mysql://mysql-reference:3306/reference_db  # ✅
spring.datasource.username=reference_service
```

### 5. Frontend Services - Variables d'environnement

#### docker-compose.yml - Tous les frontends
```yaml
# AVANT
environment:
  - REACT_APP_API_URL=http://localhost:8080  # ❌ Ne fonctionne pas depuis le navigateur

# APRÈS
environment:
  - REACT_APP_API_URL=http://gateway-pvvih:8080  # ✅ Utilise le nom du service
  - REACT_APP_GATEWAY_URL=http://gateway-pvvih:8080
```

**Note importante**: Les frontends s'exécutent dans le navigateur du client, donc ils doivent utiliser `localhost:8080` pour accéder au gateway depuis l'extérieur. Mais pour la communication interne Docker, on utilise `gateway-pvvih:8080`.

### 6. .env.example
```env
# AVANT
FORUM_DB_URL=jdbc:postgresql://postgres:5432/forum_db
USER_DB_URL=jdbc:postgresql://postgres:5432/user_db

# APRÈS
MONGO_PASSWORD=admin123
MYSQL_ROOT_PASSWORD=root123
MYSQL_USER_PASSWORD=user123
MYSQL_REFERENCE_PASSWORD=reference123
MYSQL_PATIENT_PASSWORD=patient123
```

## 🔍 Fichiers à vérifier manuellement

### Backend Services - Code Java

Les fichiers suivants contiennent des références à `localhost` dans le code Java et doivent être vérifiés:

#### 1. gestion_user/src/main/java/sn/uasz/User_API_PVVIH/controllers/ProxyController.java
```java
// AVANT
String url = "http://localhost:8080/api/sujets";  // ❌

// APRÈS - Option 1: Utiliser le nom du service
String url = "http://forum-pvvih:8080/api/sujets";  // ✅

// APRÈS - Option 2: Utiliser le gateway
String url = "http://gateway-pvvih:8080/api/sujets";  // ✅ Recommandé
```

#### 2. Configuration CORS

**Fichiers à mettre à jour:**
- `Getway_PVVIH/src/main/java/sn/uasz/Getway_PVVIH/config/SecurityConfig.java`
- `gestion_user/src/main/java/sn/uasz/User_API_PVVIH/config/SecurityConfig.java`
- `gestion_user/src/main/java/sn/uasz/User_API_PVVIH/controllers/MembreController.java`
- `gestion_user/src/main/java/sn/uasz/User_API_PVVIH/controllers/UserController.java`
- `gestion_user/src/main/java/sn/uasz/User_API_PVVIH/controllers/HopitalController.java`

```java
// AVANT
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",  // ❌
    "http://localhost:3001",
    "http://localhost:8080"
));

// APRÈS
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",  // ✅ Garder pour accès depuis navigateur
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:8080",
    "http://gateway-pvvih:8080",  // ✅ Ajouter pour communication interne
    "http://gestion-forum-front",
    "http://a-reference-front",
    "http://a-user-front"
));
```

**Note**: Pour CORS, on garde `localhost` car les requêtes viennent du navigateur du client, pas des conteneurs Docker.

## 🚀 Communication entre services

### Règles de communication

1. **Service Backend → Service Backend**
   - ✅ Utiliser le nom du service Docker: `http://gestion-user:8080`
   - ❌ NE PAS utiliser: `http://localhost:9089`

2. **Service Backend → Base de données**
   - ✅ Utiliser le nom du service Docker: `jdbc:mysql://mysql-user:3306/user_db`
   - ❌ NE PAS utiliser: `jdbc:mysql://localhost:3306/user_db`

3. **Service Backend → Eureka/Config**
   - ✅ Utiliser le nom du service Docker: `http://api-register:8761/eureka/`
   - ❌ NE PAS utiliser: `http://localhost:8761/eureka/`

4. **Frontend (navigateur) → Gateway**
   - ✅ Utiliser localhost avec le port externe: `http://localhost:8080`
   - ℹ️ Le navigateur n'est pas dans Docker, il accède depuis l'extérieur

5. **Frontend (conteneur) → Gateway** (pour SSR ou build)
   - ✅ Utiliser le nom du service Docker: `http://gateway-pvvih:8080`

## 📊 Architecture de communication

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigateur (Client)                       │
│                                                               │
│  Accès via localhost:3001, localhost:3002, localhost:3003   │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Réseau Docker: pvvih-network                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────── Frontends ────────────────┐              │
│  │  gestion-forum-front (port 3001)          │              │
│  │  a-reference-front (port 3002)            │              │
│  │  a-user-front (port 3003)                 │              │
│  └───────────────┬───────────────────────────┘              │
│                  │                                            │
│                  ▼                                            │
│  ┌──────────────── Gateway ─────────────────┐              │
│  │  gateway-pvvih:8080 (port 8080)          │              │
│  └───────────────┬───────────────────────────┘              │
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
│  ┌──────────────── Edge Services ────────────┐              │
│  │  api-register:8761                         │              │
│  │  api-configuration:8888                    │              │
│  └────────────────────────────────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Checklist de vérification

- [x] docker-compose.yml mis à jour avec les bases de données
- [x] docker-compose.yml mis à jour avec les noms de services
- [x] Gateway application.yaml mis à jour
- [x] bootstrap.properties des backends mis à jour
- [x] application.properties des backends mis à jour
- [x] .env.example mis à jour
- [ ] Code Java - ProxyController.java à vérifier
- [ ] Code Java - SecurityConfig.java CORS à vérifier
- [ ] Code Java - Controllers @CrossOrigin à vérifier
- [ ] Frontend - fichiers de configuration API à vérifier

## 🔧 Prochaines étapes

1. **Vérifier les fichiers Java** listés ci-dessus
2. **Tester la communication** entre services
3. **Vérifier les logs** pour les erreurs de connexion
4. **Ajuster les timeouts** si nécessaire

## 📚 Ressources

- [Docker Networking](https://docs.docker.com/network/)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Eureka Service Discovery](https://cloud.spring.io/spring-cloud-netflix/)
