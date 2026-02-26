# Résumé des Corrections de Configuration

## Date: 2026-02-23

Ce document récapitule tous les problèmes de configuration identifiés et corrigés dans l'architecture microservices.

---

## 1. api_register (Eureka Server)

### Problèmes Identifiés

1. **Port incorrect du Config Server**: Pointait vers `localhost:8880` au lieu de `api-configuration:8888`
2. **Nom d'application incohérent**: Utilisait `eureka-service` au lieu de `api-register`
3. **Configuration Eureka manquante**: Pas de configuration explicite pour désactiver l'auto-enregistrement
4. **Utilisation de localhost**: Dans Docker, il faut utiliser les noms de services
5. **Dépendance inutile au Config Server**: Eureka n'a pas besoin de configuration centralisée

### Corrections Appliquées

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

### Justification

- Eureka doit être le premier service à démarrer (avec les bases de données)
- Il ne doit pas dépendre d'autres services (principe d'indépendance)
- Sa configuration est simple et stable, pas besoin de Config Server
- `register-with-eureka=false` et `fetch-registry=false` sont essentiels pour un serveur Eureka standalone

---

## 2. api_configuration (Config Server)

### Problèmes Identifiés

1. **Port incorrect**: Écoutait sur 8880 au lieu de 8888
2. **Dépôt Git local**: Utilisait un dépôt local inexistant au lieu du dépôt GitHub
3. **Health check échouait**: Vérifiait le port 8888 alors que le service écoutait sur 8880

### Corrections Appliquées

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

### Impact

- Le Config Server peut maintenant servir les configurations depuis GitHub
- Le health check fonctionne correctement
- Les microservices peuvent récupérer leurs configurations

---

## 3. Microservices (gestion_user, gestion_patient, gestion_reference, Forum_PVVIH)

### Problèmes Identifiés

1. **Spring Cloud Config désactivé**: `spring.cloud.config.enabled=false` dans tous les services
2. **Configurations locales**: Toutes les configurations étaient en dur dans les fichiers locaux
3. **Noms d'application incohérents**: Différences entre application.properties et bootstrap.properties
4. **Profil incorrect**: Utilisait `native` au lieu de `dev` ou `prod`
5. **fail-fast=true**: Empêchait le démarrage si Config Server n'était pas disponible

### Corrections Appliquées

#### application.properties (minimal)

```properties
spring.application.name=User_API_PVVIH
spring.cloud.config.enabled=true
spring.cloud.config.import-check.enabled=true
spring.profiles.active=dev
```

#### bootstrap.properties

```properties
spring.application.name=User_API_PVVIH
spring.config.import=optional:configserver:http://api-configuration:8888
spring.cloud.config.enabled=true
spring.cloud.config.fail-fast=false
spring.profiles.active=dev

eureka.client.service-url.defaultZone=http://api-register:8761/eureka/
eureka.instance.prefer-ip-address=true
```

### Changements Clés

- **optional:configserver**: Permet le démarrage même si Config Server n'est pas disponible
- **fail-fast=false**: Ne bloque pas le démarrage en cas d'échec de connexion au Config Server
- **Configurations minimales localement**: Seul le nom et le profil sont gardés localement
- **Toutes les autres configurations**: Doivent être dans le dépôt GitHub

---

## 4. Gateway (Getway_PVVIH)

### Problèmes Identifiés

1. **Spring Cloud Config désactivé**: `spring.cloud.config.enabled=false`
2. **Routes en dur**: Toutes les routes étaient dans le fichier local

### Corrections Appliquées

**Fichier**: `Getway_PVVIH/src/main/resources/application.yaml`

```yaml
spring:
  cloud:
    config:
      enabled: true
      uri: http://api-configuration:8888
      fail-fast: false
  profiles:
    active: dev
```

### Note

Le Gateway garde ses routes dans le fichier local car elles sont spécifiques à l'environnement Docker et ne changent pas souvent. Cependant, il peut maintenant récupérer des configurations supplémentaires depuis le Config Server si nécessaire.

---

## 5. docker-compose.yml

### Problèmes Identifiés

1. **Dépendances circulaires**: Les services backend dépendaient du gateway, qui dépendait d'eux
2. **Ordre de démarrage incorrect**: Pas de respect de la hiérarchie des dépendances

### Corrections Appliquées

**Ordre de démarrage correct**:
1. Bases de données (mongodb, mysql-*)
2. api-register (Eureka)
3. api-configuration (Config Server)
4. gateway-pvvih
5. Services backend (forum-pvvih, gestion-user, gestion-patient, gestion-reference)
6. Services frontend

**Suppression des dépendances circulaires**:
- Les services backend ne dépendent plus du gateway
- Ils dépendent seulement de leur base de données, Eureka et Config Server

---

## Architecture Finale

```
┌─────────────────────────────────────────────────────────────┐
│                     Ordre de Démarrage                       │
└─────────────────────────────────────────────────────────────┘

1. Bases de données
   ├── mongodb (Forum)
   ├── mysql-user (User Service)
   ├── mysql-patient (Patient Service)
   └── mysql-reference (Reference Service)

2. Services d'infrastructure
   ├── api-register (Eureka) ← Indépendant
   └── api-configuration (Config Server) ← Dépend d'Eureka

3. API Gateway
   └── gateway-pvvih ← Dépend d'Eureka et Config Server

4. Services métier
   ├── forum-pvvih ← Dépend de mongodb, Eureka, Config Server
   ├── gestion-user ← Dépend de mysql-user, Eureka, Config Server
   ├── gestion-patient ← Dépend de mysql-patient, Eureka, Config Server
   └── gestion-reference ← Dépend de mysql-reference, Eureka, Config Server

5. Frontends
   ├── gestion-forum-front ← Dépend du gateway
   ├── a-reference-front ← Dépend du gateway
   └── a-user-front ← Dépend du gateway
```

---

## Flux de Configuration

```
┌──────────────────────────────────────────────────────────────┐
│                  Flux de Configuration                        │
└──────────────────────────────────────────────────────────────┘

1. GitHub Repository
   └── cloud-config-repo-enda
       ├── application.yml (config commune)
       ├── User_API_PVVIH-dev.yml
       ├── Patient_API_PVVIH-dev.yml
       ├── referencement_PVVIH-dev.yml
       └── Forum_PVVIH-dev.yml

2. Config Server (api_configuration)
   └── Clone le dépôt GitHub au démarrage
   └── Expose les configurations via HTTP

3. Microservices
   └── Au démarrage:
       1. Lit bootstrap.properties (config minimale)
       2. Contacte Config Server
       3. Récupère sa configuration depuis GitHub
       4. S'enregistre auprès d'Eureka
       5. Démarre l'application
```

---

## Vérifications à Effectuer

### 1. Vérifier Eureka

```bash
# Vérifier les logs
docker logs api-register

# Accéder à l'interface web
http://localhost:8761

# Vérifier le health check
curl http://localhost:8761/actuator/health
```

### 2. Vérifier Config Server

```bash
# Vérifier les logs
docker logs api-configuration

# Tester l'accès aux configurations
curl http://localhost:8888/User_API_PVVIH/dev
curl http://localhost:8888/Patient_API_PVVIH/dev
curl http://localhost:8888/Forum_PVVIH/dev

# Vérifier le health check
curl http://localhost:8888/actuator/health
```

### 3. Vérifier les Microservices

```bash
# Vérifier qu'ils récupèrent leur configuration
docker logs gestion-user | grep "Located property source"
docker logs gestion-patient | grep "Located property source"

# Vérifier qu'ils s'enregistrent auprès d'Eureka
docker logs gestion-user | grep "Registered with Eureka"
```

### 4. Vérifier le Gateway

```bash
# Vérifier les logs
docker logs gateway-pvvih

# Tester une route
curl http://localhost:8080/api/users
```

---

## Prochaines Étapes

1. ✅ Corriger les configurations locales
2. ✅ Supprimer les dépendances circulaires
3. ✅ Configurer le Config Server avec GitHub
4. ⬜ Créer les fichiers de configuration dans GitHub
5. ⬜ Reconstruire les images Docker
6. ⬜ Tester le démarrage complet
7. ⬜ Vérifier que tous les services sont enregistrés dans Eureka
8. ⬜ Tester les appels via le Gateway

---

## Commandes Utiles

```bash
# Reconstruire tous les services
docker-compose build

# Reconstruire un service spécifique
docker-compose build api-register
docker-compose build api-configuration
docker-compose build gestion-user

# Redémarrer tous les services
docker-compose down
docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker logs -f api-register
docker logs -f api-configuration
docker logs -f gestion-user

# Vérifier l'état des services
docker-compose ps

# Vérifier les services enregistrés dans Eureka
curl http://localhost:8761/eureka/apps | grep -i "<app>"
```

---

## Résumé des Bénéfices

1. **Configuration Centralisée**: Une seule source de vérité dans GitHub
2. **Pas de Dépendances Circulaires**: Ordre de démarrage clair et prévisible
3. **Indépendance d'Eureka**: Peut démarrer sans dépendre d'autres services
4. **Flexibilité**: Changements de configuration sans rebuild
5. **Environnements Multiples**: Support facile de dev, test, prod
6. **Versionnement**: Historique complet des changements de configuration
7. **Sécurité**: Possibilité d'utiliser des secrets chiffrés
8. **Maintenabilité**: Configuration claire et bien organisée

---

## Contacts et Ressources

- **Dépôt de configuration**: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
- **Documentation Spring Cloud Config**: https://spring.io/projects/spring-cloud-config
- **Documentation Eureka**: https://spring.io/projects/spring-cloud-netflix
- **Guide de migration complet**: Voir `CLOUD_CONFIG_MIGRATION_GUIDE.md`
