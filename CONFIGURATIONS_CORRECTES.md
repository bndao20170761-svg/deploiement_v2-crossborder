# Configurations Correctes pour Tous les Microservices

## 📁 Emplacement
Tous ces fichiers doivent être dans : `C:\Users\babac\cloud-config-repo\cloud-config-repo-enda`

---

## 1️⃣ Forum_API_PVVIH-dev.properties

```properties
# Configuration Cloud Config
spring.application.name=Forum_API_PVVIH
server.port=8080

# Configuration MongoDB
spring.data.mongodb.uri=mongodb://admin:${MONGO_PASSWORD:admin123}@mongodb:27017/forum_db?authSource=admin
spring.data.mongodb.database=forum_db

# Configuration Feign
feign.client.config.default.connect-timeout=86400
feign.client.config.default.read-timeout=86400

# URL du microservice gestion_user (utiliser le nom du service Docker)
gestion.user.url=http://gestion-user:8080

# JWT configuration
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000

# Configuration des services de traduction
translation.google.enabled=false
translation.libre.enabled=true
translation.libre.url=http://localhost:5000
translation.cache.enabled=true

# Désactiver la vérification de compatibilité Spring Cloud
spring.cloud.compatibility-verifier.enabled=false
```

**Points critiques :**
- ✅ `gestion.user.url=http://gestion-user:8080` (avec `http://`)
- ✅ `app.jwt.secret` présent
- ✅ MongoDB utilise le nom du service Docker `mongodb`

---

## 2️⃣ User_API_PVVIH-dev.properties

```properties
spring.application.name=User_API_PVVIH
server.port=8080

# Configuration base de données
spring.datasource.url=jdbc:mysql://mysql-user:3306/user_db
spring.datasource.username=user_service
spring.datasource.password=user123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP : limite les avertissements "clock leap" après veille du PC
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.keepalive-time=30000
spring.datasource.hikari.connection-timeout=30000

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Sécurité / JWT
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000

# Réduire les logs verbeux
logging.level.com.netflix.discovery=WARN
logging.level.com.zaxxer.hikari=ERROR
```

**Points critiques :**
- ✅ `mysql-user:3306` (nom du service Docker)
- ✅ `user_service` / `user123` (credentials du docker-compose)
- ✅ `app.jwt.secret` présent

---

## 3️⃣ Patient_API_PVVIH-dev.properties

```properties
spring.application.name=Patient_API_PVVIH
server.port=8080

# Configuration base de données
spring.datasource.url=jdbc:mysql://mysql-patient:3306/patient_db
spring.datasource.username=patient_service
spring.datasource.password=patient123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Sécurité / JWT
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000
```

**Points critiques :**
- ✅ `mysql-patient:3306` (nom du service Docker)
- ✅ `patient_service` / `patient123` (credentials du docker-compose)
- ✅ `app.jwt.secret` présent

---

## 4️⃣ Reference_API_PVVIH-dev.properties

```properties
spring.application.name=Reference_API_PVVIH
server.port=8080

# Configuration base de données
spring.datasource.url=jdbc:mysql://mysql-reference:3306/reference_db
spring.datasource.username=reference_service
spring.datasource.password=reference123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Sécurité / JWT
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000

# Bean definition overriding
spring.main.allow-bean-definition-overriding=true

# Logs pour debugging
logging.level.sn.uasz.referencement_PVVIH.feign=DEBUG
logging.level.sn.uasz.referencement_PVVIH.config.FeignClientInterceptor=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.feign=DEBUG
```

**Points critiques :**
- ✅ `mysql-reference:3306` (nom du service Docker)
- ✅ `reference_service` / `reference123` (credentials du docker-compose)
- ✅ `app.jwt.secret` présent
- ✅ `spring.main.allow-bean-definition-overriding=true` (nécessaire pour ce service)

---

## 5️⃣ GETWAY_PVVIH-dev.yaml

**⚠️ ATTENTION : Fichier YAML, pas .properties !**

```yaml
server:
  port: 8080

spring:
  application:
    name: GETWAY_PVVIH
  # NE PAS mettre spring.cloud.config.enabled: false ici !
  cloud:
    gateway:
      httpclient:
        connect-timeout: 10000
        response-timeout: 30s
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      default-filters:
        - AddRequestHeader=X-Forwarded-Proto, http
        - AddRequestHeader=X-Forwarded-Host, gateway-pvvih:8080
        - PreserveHostHeader
      routes:
        # Route pour USER_API_PVVIH - Auth endpoints avec rewrite
        - id: user-api-auth-rewrite
          uri: http://gestion-user:8080
          predicates:
            - Path=/api/user-auth/**
          filters:
            - RewritePath=/api/user-auth/(?<path>.*), /api/auth/$\{path}
            - RemoveRequestHeader=Cookie
            - RemoveRequestHeader=Set-Cookie
        
        # Route pour USER_API_PVVIH - Auth endpoints directs
        - id: user-api-auth
          uri: http://gestion-user:8080
          predicates:
            - Path=/api/auth/**

        # Route pour USER_API_PVVIH - Direct API endpoints
        - id: user-api-direct
          uri: http://gestion-user:8080
          predicates:
            - Path=/api/users/**, /api/doctors/**, /api/membres/**, /api/patients/**, /api/hospitaux/**, /api/associations/**, /api/assistants/**

        # Route pour USER_API_PVVIH - Alternative spellings
        - id: user-api-alternatives
          uri: http://gestion-user:8080
          predicates:
            - Path=/api/hopitaux/**, /hospitaux/**, /hopitaux/**
          filters:
            - RewritePath=/api/hopitaux/(?<path>.*), /api/hospitaux/$\{path}
            - RewritePath=/hospitaux/(?<path>.*), /api/hospitaux/$\{path}
            - RewritePath=/hopitaux/(?<path>.*), /api/hospitaux/$\{path}

        # Route pour USER_API_PVVIH - Service direct access
        - id: user-api-service
          uri: http://gestion-user:8080
          predicates:
            - Path=/user_api_pvvih/**
          filters:
            - RewritePath=/user_api_pvvih/(?<path>.*), /$\{path}

        # Route pour PATIENT_PVVIH
        - id: patient-pvvih
          uri: http://gestion-patient:8080
          predicates:
            - Path=/api/patients-proxy/**, /api/dossiers/**, /api/user-integration/**, /patient_pvvih/**
          filters:
            - RewritePath=/api/patients-proxy/(?<path>.*), /api/patients/$\{path}
            - RewritePath=/patient_pvvih/(?<path>.*), /$\{path}

        # Route pour FORUM_PVVIH
        - id: forum-pvvih
          uri: http://forum-pvvih:8080
          predicates:
            - Path=/api/sujets/**, /api/commentaires/**, /api/translation/**, /api/forum-auth/**, /api/admin/sections/**, /forum_pvvih/**
          filters:
            - RewritePath=/api/sujets/(?<path>.*), /$\{path}
            - RewritePath=/api/commentaires/(?<path>.*), /$\{path}
            - RewritePath=/api/translation/(?<path>.*), /$\{path}
            - RewritePath=/api/forum-auth/(?<path>.*), /api/auth/$\{path}
            - RewritePath=/api/admin/sections/(?<path>.*), /$\{path}
            - RewritePath=/forum_pvvih/(?<path>.*), /$\{path}

        # Route pour REFERENCEMENT_PVVIH
        - id: referencement-pvvih
          uri: http://gestion-reference:8080
          predicates:
            - Path=/api/references/**, /api/contre-references/**, /api/hopitaux-proxy/**, /api/integration/**, /api/reference-auth/**, /reference_pvvih/**
          filters:
            - RewritePath=/api/reference-auth/(?<path>.*), /api/auth/$\{path}
            - RewritePath=/reference_pvvih/(?<path>.*), /$\{path}

# Eureka configuration
eureka:
  client:
    enabled: true
    service-url:
      defaultZone: http://api-register:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${spring.application.instance_id:${server.port}}

# Actuator
management:
  endpoints:
    web:
      exposure:
        include: "*"
  endpoint:
    gateway:
      enabled: true
    health:
      show-details: always

# Logging
logging:
  level:
    org.springframework.cloud.gateway: DEBUG
    org.springframework.web: DEBUG
    org.springframework.web.cors: DEBUG
    reactor.netty: DEBUG
    org.springframework.cloud.gateway.route: DEBUG
    org.springframework.cloud.gateway.filter: DEBUG
```

**Points critiques :**
- ❌ **PAS de** `spring.cloud.config.enabled: false`
- ✅ Tous les URIs utilisent les noms de services Docker
- ✅ Eureka pointe vers `api-register:8761`

---

## ✅ Checklist de Vérification

Avant de commiter, vérifiez :

### Fichier Forum_API_PVVIH-dev.properties
- [ ] `gestion.user.url=http://gestion-user:8080` (avec http://)
- [ ] `app.jwt.secret` présent
- [ ] `mongodb` comme nom d'hôte

### Fichier User_API_PVVIH-dev.properties
- [ ] `mysql-user:3306` comme URL
- [ ] `user_service` / `user123` comme credentials
- [ ] `app.jwt.secret` présent

### Fichier Patient_API_PVVIH-dev.properties
- [ ] `mysql-patient:3306` comme URL
- [ ] `patient_service` / `patient123` comme credentials
- [ ] `app.jwt.secret` présent

### Fichier Reference_API_PVVIH-dev.properties
- [ ] `mysql-reference:3306` comme URL
- [ ] `reference_service` / `reference123` comme credentials
- [ ] `app.jwt.secret` présent

### Fichier GETWAY_PVVIH-dev.yaml
- [ ] **PAS de** `spring.cloud.config.enabled: false`
- [ ] Tous les URIs utilisent les noms Docker
- [ ] `defaultZone: http://api-register:8761/eureka/`

---

## 🚀 Étapes de Déploiement

Une fois tous les fichiers vérifiés et corrigés :

```bash
# 1. Aller dans le dépôt Git
cd C:\Users\babac\cloud-config-repo\cloud-config-repo-enda

# 2. Ajouter tous les fichiers
git add .

# 3. Commiter
git commit -m "Configuration Docker complète pour tous les microservices"

# 4. Pousser vers GitHub
git push origin main

# 5. Revenir au projet
cd "C:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder"

# 6. Redémarrer le Config Server
docker-compose restart api-configuration

# 7. Attendre 15 secondes
Start-Sleep -Seconds 15

# 8. Redémarrer tous les microservices
docker-compose restart forum-pvvih gestion-user gestion-patient gestion-reference gateway-pvvih

# 9. Voir les logs
docker-compose logs -f
```

---

## 🔍 Vérification du Succès

Vous saurez que tout fonctionne quand vous verrez :

✅ Dans les logs du Config Server :
```
Cloning repository...
Successfully cloned repository
```

✅ Dans les logs des microservices :
```
Located environment: name=Forum_API_PVVIH, profiles=[dev]
Tomcat started on port(s): 8080
```

✅ Pas d'erreurs :
```
❌ Could not resolve placeholder 'app.jwt.secret'
❌ Could not resolve placeholder 'gestion.user.url'
```

✅ Dans Eureka (http://localhost:8761) :
- FORUM_API_PVVIH
- USER_API_PVVIH
- PATIENT_API_PVVIH
- REFERENCE_API_PVVIH
- GETWAY_PVVIH

Tous enregistrés et en statut UP !
