# Guide de Migration vers Spring Cloud Config Centralisé

## Vue d'ensemble

Ce document explique comment migrer vos configurations microservices vers un dépôt Git centralisé pour utiliser correctement Spring Cloud Config.

## Architecture Actuelle vs Architecture Cible

### Avant (Configuration Locale)
- Chaque microservice a ses propres fichiers `application.properties`
- Configurations dupliquées et difficiles à maintenir
- Nécessite rebuild des images pour changer la configuration

### Après (Configuration Centralisée)
- Toutes les configurations dans le dépôt GitHub: `https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git`
- Configuration centralisée et versionnée
- Changements sans rebuild des images
- Gestion des environnements (dev, prod) simplifiée

## Structure du Dépôt de Configuration

Votre dépôt GitHub doit contenir les fichiers suivants:

```
cloud-config-repo-enda/
├── application.yml                    # Configuration commune à tous les services
├── User_API_PVVIH-dev.yml            # Configuration dev pour gestion_user
├── User_API_PVVIH-prod.yml           # Configuration prod pour gestion_user
├── Patient_API_PVVIH-dev.yml         # Configuration dev pour gestion_patient
├── Patient_API_PVVIH-prod.yml        # Configuration prod pour gestion_patient
├── referencement_PVVIH-dev.yml       # Configuration dev pour gestion_reference
├── referencement_PVVIH-prod.yml      # Configuration prod pour gestion_reference
├── Forum_PVVIH-dev.yml               # Configuration dev pour Forum
├── Forum_PVVIH-prod.yml              # Configuration prod pour Forum
├── GETWAY_PVVIH-dev.yml              # Configuration dev pour Gateway
└── GETWAY_PVVIH-prod.yml             # Configuration prod pour Gateway
```

## Contenu des Fichiers de Configuration

### 1. application.yml (Configuration Commune)

```yaml
# Configuration commune à tous les microservices
eureka:
  client:
    service-url:
      defaultZone: http://api-register:8761/eureka/
  instance:
    prefer-ip-address: true

# JWT Configuration commune
app:
  jwt:
    secret: hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
    expiration: 3600000

# Logging par défaut
logging:
  level:
    com.netflix.discovery: WARN
    com.zaxxer.hikari: ERROR
```

### 2. User_API_PVVIH-dev.yml

```yaml
server:
  port: 8080

# Configuration base de données
spring:
  datasource:
    url: jdbc:mysql://mysql-user:3306/user_db
    username: user_service
    password: user123
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      max-lifetime: 1800000
      keepalive-time: 30000
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

# Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

### 3. Patient_API_PVVIH-dev.yml

```yaml
server:
  port: 8080

# Configuration base de données
spring:
  datasource:
    url: jdbc:mysql://mysql-patient:3306/patient_db
    username: patient_service
    password: patient123
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

# Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

### 4. referencement_PVVIH-dev.yml

```yaml
server:
  port: 8080

# Configuration base de données
spring:
  datasource:
    url: jdbc:mysql://mysql-reference:3306/reference_db
    username: reference_service
    password: reference123
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
  
  main:
    allow-bean-definition-overriding: true

# Logs pour debugging
logging:
  level:
    sn.uasz.referencement_PVVIH.feign: DEBUG
    sn.uasz.referencement_PVVIH.config.FeignClientInterceptor: DEBUG
    org.springframework.security: DEBUG
    feign: DEBUG

# Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

### 5. Forum_PVVIH-dev.yml

```yaml
server:
  port: 8080

# Configuration MongoDB
spring:
  data:
    mongodb:
      uri: mongodb://admin:admin123@mongodb:27017/forum_db?authSource=admin
  
  cloud:
    compatibility-verifier:
      enabled: false

# Configuration Feign
feign:
  client:
    config:
      default:
        connect-timeout: 86400
        read-timeout: 86400

# URL du microservice gestion_user
gestion:
  user:
    url: http://gestion-user:8080

# Configuration des services de traduction
translation:
  google:
    enabled: false
  libre:
    enabled: true
    url: http://localhost:5000
  cache:
    enabled: true

# Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

### 6. GETWAY_PVVIH-dev.yml

```yaml
# Le Gateway garde sa configuration locale dans application.yaml
# car elle contient les routes qui sont spécifiques à l'environnement Docker
# Vous pouvez ajouter ici des configurations supplémentaires si nécessaire

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
```

## Configurations de Production

Pour chaque fichier `-dev.yml`, créez un fichier `-prod.yml` correspondant avec:
- Mots de passe sécurisés (utilisez des secrets)
- URLs de production
- Logging moins verbeux
- Optimisations de performance

Exemple pour `User_API_PVVIH-prod.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://mysql-user-prod:3306/user_db
    username: ${DB_USERNAME}  # Variable d'environnement
    password: ${DB_PASSWORD}  # Variable d'environnement
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  
  jpa:
    hibernate:
      ddl-auto: validate  # Ne pas modifier le schéma en prod
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

logging:
  level:
    root: INFO
    com.netflix.discovery: WARN

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: when-authorized
```

## Modifications Effectuées dans le Code

### 1. api_register (Eureka Server)

**Fichier**: `api_register/src/main/resources/application.properties`

```properties
spring.application.name=api-register
server.port=8761

# Eureka Server Configuration - Ne pas s'enregistrer lui-même
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.server.enable-self-preservation=true

# Désactiver Spring Cloud Config pour Eureka (il n'en a pas besoin)
spring.cloud.config.enabled=false

# Actuator pour health check
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=always
```

**Note**: Le serveur Eureka n'a pas besoin de Spring Cloud Config car sa configuration est simple et stable. Il doit démarrer en premier et être indépendant.

### 2. api_configuration (Config Server)

**Fichier**: `api_configuration/demo/src/main/resources/application.properties`

```properties
spring.application.name=config-server
server.port=8888

# Configuration du dépôt Git centralisé
spring.cloud.config.server.git.uri=https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
spring.cloud.config.server.git.default-label=main
spring.cloud.config.server.git.clone-on-start=true
spring.cloud.config.server.git.timeout=10
spring.cloud.config.server.git.skip-ssl-validation=false
```

### 2. Microservices (gestion_user, gestion_patient, etc.)

**application.properties** (minimal):
```properties
spring.application.name=User_API_PVVIH
spring.cloud.config.enabled=true
spring.cloud.config.import-check.enabled=true
spring.profiles.active=dev
```

**bootstrap.properties**:
```properties
spring.application.name=User_API_PVVIH
spring.config.import=optional:configserver:http://api-configuration:8888
spring.cloud.config.enabled=true
spring.cloud.config.fail-fast=false
spring.profiles.active=dev

eureka.client.service-url.defaultZone=http://api-register:8761/eureka/
eureka.instance.prefer-ip-address=true
```

## Étapes de Migration

### 1. Préparer le Dépôt GitHub

```bash
# Cloner votre dépôt
git clone https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
cd cloud-config-repo-enda

# Créer les fichiers de configuration
# (Utilisez les templates ci-dessus)

# Commit et push
git add .
git commit -m "Add centralized microservices configuration"
git push origin main
```

### 2. Reconstruire les Images Docker

```bash
# Reconstruire tous les services
docker-compose build

# Ou reconstruire un service spécifique
docker-compose build api-configuration
docker-compose build gestion-user
docker-compose build gestion-patient
docker-compose build gestion-reference
docker-compose build forum-pvvih
docker-compose build gateway-pvvih
```

### 3. Redémarrer les Services

```bash
# Arrêter tous les services
docker-compose down

# Démarrer avec la nouvelle configuration
docker-compose up -d
```

### 4. Vérifier le Fonctionnement

```bash
# Vérifier que api-configuration démarre correctement
docker logs api-configuration

# Vérifier qu'il peut accéder au dépôt GitHub
# Vous devriez voir dans les logs: "Cloning from https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git"

# Tester l'accès aux configurations
curl http://localhost:8888/User_API_PVVIH/dev
curl http://localhost:8888/Patient_API_PVVIH/dev
curl http://localhost:8888/Forum_PVVIH/dev

# Vérifier que les microservices démarrent et récupèrent leur configuration
docker logs gestion-user
docker logs gestion-patient
```

## Avantages de cette Architecture

1. **Configuration Centralisée**: Une seule source de vérité pour toutes les configurations
2. **Versionnement**: Historique complet des changements via Git
3. **Environnements Multiples**: Gestion facile de dev, test, prod
4. **Pas de Rebuild**: Changements de configuration sans reconstruire les images
5. **Sécurité**: Possibilité d'utiliser des secrets chiffrés
6. **Rafraîchissement Dynamique**: Les services peuvent recharger leur configuration sans redémarrage

## Dépannage

### Problème: Config Server ne peut pas cloner le dépôt

**Solution**: Vérifiez que le dépôt est public ou configurez l'authentification:

```properties
spring.cloud.config.server.git.uri=https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
spring.cloud.config.server.git.username=${GIT_USERNAME}
spring.cloud.config.server.git.password=${GIT_PASSWORD}
```

### Problème: Microservice ne trouve pas sa configuration

**Vérifications**:
1. Le nom dans `spring.application.name` correspond au nom du fichier dans le dépôt
2. Le profil actif (`spring.profiles.active`) correspond au suffixe du fichier
3. Le Config Server est accessible depuis le microservice

### Problème: Configuration locale prioritaire sur Config Server

**Solution**: Assurez-vous que `spring.cloud.config.enabled=true` et supprimez les configurations en conflit dans `application.properties` local.

## Prochaines Étapes

1. ✅ Créer les fichiers de configuration dans le dépôt GitHub
2. ✅ Reconstruire les images Docker
3. ✅ Tester en environnement de développement
4. ⬜ Créer les configurations de production
5. ⬜ Configurer les secrets pour la production
6. ⬜ Mettre en place le rafraîchissement dynamique avec Spring Cloud Bus (optionnel)

## Ressources

- [Spring Cloud Config Documentation](https://spring.io/projects/spring-cloud-config)
- [Votre dépôt de configuration](https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git)
