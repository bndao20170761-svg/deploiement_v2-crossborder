# Correction de la Configuration du Gateway

## Problème Identifié

Vous avez créé un fichier `application_getway.yaml` dans votre dépôt GitHub, mais Spring Cloud Config ne peut pas le trouver car il utilise une **convention de nommage stricte**.

## Convention de Nommage Spring Cloud Config

Spring Cloud Config cherche les fichiers selon ce format:
```
{application-name}-{profile}.yml
```

Exemples:
- `GETWAY_PVVIH-dev.yml` ✅
- `GETWAY_PVVIH-prod.yml` ✅
- `User_API_PVVIH-dev.yml` ✅
- `application_getway.yaml` ❌ (ne sera jamais trouvé)

## Solution: Renommer le Fichier dans GitHub

### Étape 1: Accéder à votre dépôt GitHub

```bash
cd /chemin/vers/cloud-config-repo-enda
# ou clonez-le si nécessaire
git clone https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
cd cloud-config-repo-enda
```

### Étape 2: Renommer le fichier

**Option A: Via Git (Recommandé)**
```bash
# Renommer le fichier
git mv application_getway.yaml GETWAY_PVVIH-dev.yml

# Commit
git commit -m "Rename gateway config to follow Spring Cloud Config naming convention"

# Push
git push origin main
```

**Option B: Via GitHub Web Interface**
1. Allez sur https://github.com/BabacarNdaoKgl/cloud-config-repo-enda
2. Cliquez sur `application_getway.yaml`
3. Cliquez sur l'icône crayon (Edit)
4. Changez le nom du fichier en `GETWAY_PVVIH-dev.yml`
5. Commit les changements

### Étape 3: Vérifier le contenu du fichier

Le fichier `GETWAY_PVVIH-dev.yml` dans GitHub devrait contenir:

```yaml
# Configuration Eureka pour le Gateway
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

# Configuration CORS (si nécessaire)
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowedHeaders: "*"
            allowCredentials: true
```

## Architecture de Configuration du Gateway

### Configuration Locale (dans le projet)

**Fichier**: `Getway_PVVIH/src/main/resources/application.properties`
```properties
spring.application.name=GETWAY_PVVIH
spring.cloud.config.enabled=true
spring.cloud.config.fail-fast=false
spring.profiles.active=dev
```

**Fichier**: `Getway_PVVIH/src/main/resources/bootstrap.properties`
```properties
spring.application.name=GETWAY_PVVIH
spring.config.import=optional:configserver:http://api-configuration:8888
spring.cloud.config.enabled=true
spring.cloud.config.fail-fast=false
spring.profiles.active=dev

eureka.client.service-url.defaultZone=http://api-register:8761/eureka/
eureka.instance.prefer-ip-address=true
```

**Fichier**: `Getway_PVVIH/src/main/resources/application.yaml`
- Contient uniquement les **routes** (spécifiques à Docker)
- Les routes restent locales car elles dépendent de l'environnement

### Configuration Distante (dans GitHub)

**Fichier**: `GETWAY_PVVIH-dev.yml` (dans le dépôt GitHub)
- Configuration Eureka
- Configuration Actuator
- Configuration Logging
- Configuration CORS
- Toutes les configurations qui peuvent changer entre environnements

## Pourquoi cette Séparation?

### Routes Locales ✅
- **Raison**: Les routes utilisent des noms de services Docker (`http://gestion-user:8080`)
- **Avantage**: Pas besoin de changer GitHub pour modifier les routes
- **Inconvénient**: Nécessite rebuild pour changer les routes

### Configuration Distante ✅
- **Raison**: Logging, Actuator, CORS peuvent changer sans rebuild
- **Avantage**: Changements sans rebuild des images
- **Inconvénient**: Nécessite accès au dépôt GitHub

## Vérification

### 1. Vérifier que le Config Server trouve la configuration

```bash
# Tester l'accès à la configuration du Gateway
curl http://localhost:8888/GETWAY_PVVIH/dev

# Vous devriez voir la configuration retournée en JSON
```

### 2. Vérifier les logs du Gateway au démarrage

```bash
docker logs gateway-pvvih | grep "Located property source"

# Vous devriez voir quelque chose comme:
# Located property source: [BootstrapPropertySource {name='bootstrapProperties-configClient'}]
# Located property source: [BootstrapPropertySource {name='bootstrapProperties-https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git/GETWAY_PVVIH-dev.yml'}]
```

### 3. Vérifier que le Gateway s'enregistre dans Eureka

```bash
# Accéder à l'interface Eureka
http://localhost:8761

# Vous devriez voir GETWAY_PVVIH dans la liste des applications
```

## Ordre de Chargement des Configurations

Quand le Gateway démarre, Spring charge les configurations dans cet ordre:

1. **bootstrap.properties** (configuration minimale)
2. **Config Server** (récupère `GETWAY_PVVIH-dev.yml` depuis GitHub)
3. **application.properties** (configuration locale)
4. **application.yaml** (routes locales)

Les configurations sont **fusionnées**, avec priorité aux configurations locales en cas de conflit.

## Fichiers à Créer/Modifier dans GitHub

### Pour Développement

**Fichier**: `GETWAY_PVVIH-dev.yml`
```yaml
# Configuration de développement
eureka:
  client:
    service-url:
      defaultZone: http://api-register:8761/eureka/

logging:
  level:
    org.springframework.cloud.gateway: DEBUG
    org.springframework.web: DEBUG

management:
  endpoints:
    web:
      exposure:
        include: "*"
```

### Pour Production

**Fichier**: `GETWAY_PVVIH-prod.yml`
```yaml
# Configuration de production
eureka:
  client:
    service-url:
      defaultZone: http://api-register-prod:8761/eureka/

logging:
  level:
    org.springframework.cloud.gateway: INFO
    org.springframework.web: WARN

management:
  endpoints:
    web:
      exposure:
        include: health,info  # Moins d'endpoints exposés en prod
  endpoint:
    health:
      show-details: when-authorized  # Sécurité renforcée
```

## Commandes Utiles

```bash
# Reconstruire le Gateway
docker-compose build gateway-pvvih

# Redémarrer le Gateway
docker-compose restart gateway-pvvih

# Voir les logs du Gateway
docker logs -f gateway-pvvih

# Tester une route
curl http://localhost:8080/api/users

# Vérifier la configuration chargée
curl http://localhost:8080/actuator/env
```

## Résumé des Actions

1. ✅ Renommer `application_getway.yaml` en `GETWAY_PVVIH-dev.yml` dans GitHub
2. ✅ Créer `bootstrap.properties` dans le projet Gateway
3. ✅ Simplifier `application.yaml` (garder seulement les routes)
4. ✅ Reconstruire l'image: `docker-compose build gateway-pvvih`
5. ✅ Redémarrer: `docker-compose restart gateway-pvvih`
6. ✅ Vérifier les logs: `docker logs gateway-pvvih`

## Dépannage

### Problème: "Could not locate PropertySource"

**Cause**: Le fichier n'est pas trouvé dans GitHub

**Solution**: Vérifier le nom du fichier et le nom de l'application
```bash
# Le nom dans bootstrap.properties doit correspondre au nom du fichier
spring.application.name=GETWAY_PVVIH  # Cherche GETWAY_PVVIH-dev.yml
```

### Problème: Gateway ne démarre pas

**Cause**: Dépendance au Config Server qui n'est pas disponible

**Solution**: Utiliser `optional:configserver` et `fail-fast=false`
```properties
spring.config.import=optional:configserver:http://api-configuration:8888
spring.cloud.config.fail-fast=false
```

### Problème: Routes ne fonctionnent pas

**Cause**: Les routes sont dans GitHub au lieu du fichier local

**Solution**: Garder les routes dans `application.yaml` local car elles utilisent des noms Docker

## Ressources

- **Dépôt de configuration**: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
- **Documentation Spring Cloud Config**: https://spring.io/projects/spring-cloud-config
- **Documentation Spring Cloud Gateway**: https://spring.io/projects/spring-cloud-gateway
- **Template de configuration**: Voir `GETWAY_PVVIH_CONFIG_FOR_GITHUB.yml`
