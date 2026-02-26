# Configuration Finale - Utilisation du Dépôt GitHub

## Vue d'ensemble

Le système est maintenant configuré pour utiliser le dépôt GitHub comme source centralisée de configuration. Le Config Server charge automatiquement les fichiers de configuration depuis :

**Dépôt GitHub:** `https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git`

## Architecture de Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                    Dépôt GitHub                              │
│  https://github.com/BabacarNdaoKgl/cloud-config-repo-enda   │
│                                                              │
│  - Forum_API_PVVIH-dev.properties                           │
│  - Patient_API_PVVIH-dev.properties                         │
│  - Reference_API_PVVIH-dev.properties                       │
│  - User_API_PVVIH-dev.properties                            │
│  - GETWAY_PVVIH-dev.yaml                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Clone au démarrage
                   ▼
         ┌─────────────────────┐
         │   Config Server     │
         │   (Port 8888)       │
         └──────────┬──────────┘
                    │
                    │ Chargement des configurations
                    │
        ┌───────────┴───────────────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────┐                      ┌───────────────┐
│ Microservices │                      │   Gateway     │
│ - Forum       │                      │  (Port 8080)  │
│ - User        │                      └───────────────┘
│ - Patient     │
│ - Reference   │
└───────────────┘
```

## Fichiers de Configuration Requis

### Dans le dépôt GitHub

Les fichiers suivants doivent exister dans le dépôt GitHub :

1. **Forum_API_PVVIH-dev.properties**
   - Configuration MongoDB
   - URL du service User
   - Configuration JWT
   - Configuration des traductions

2. **Patient_API_PVVIH-dev.properties**
   - Configuration MySQL
   - Configuration JWT
   - Configuration JPA/Hibernate

3. **Reference_API_PVVIH-dev.properties**
   - Configuration MySQL
   - Configuration JWT
   - Configuration JPA/Hibernate
   - Configuration Feign

4. **User_API_PVVIH-dev.properties**
   - Configuration MySQL
   - Configuration JWT
   - Configuration JPA/Hibernate
   - Configuration HikariCP

5. **GETWAY_PVVIH-dev.yaml**
   - Configuration des routes
   - Configuration Eureka
   - Configuration CORS
   - Configuration des timeouts

### Dans le projet local

Le dossier `cloud-config-repo` local **n'est plus nécessaire** et a été supprimé. Le Config Server charge directement depuis GitHub.

## Configuration du Config Server

Le fichier `api_configuration/demo/src/main/resources/application.properties` contient :

```properties
spring.application.name=config-server
server.port=8888

# Configuration du dépôt Git centralisé
spring.cloud.config.server.git.uri=https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
spring.cloud.config.server.git.default-label=main
spring.cloud.config.server.git.clone-on-start=true
spring.cloud.config.server.git.timeout=10

# Désactiver l'authentification de base pour simplifier
spring.cloud.config.server.git.skip-ssl-validation=false
```

## Configuration des Microservices

Chaque microservice a un fichier `bootstrap.properties` qui spécifie :

```properties
spring.application.name=<ServiceName>_API_PVVIH
spring.config.import=optional:configserver:http://api-configuration:8888
spring.cloud.config.enabled=true
spring.cloud.config.fail-fast=false
spring.profiles.active=dev
```

Le Config Server utilise ces informations pour charger le bon fichier :
- Nom de l'application : `<ServiceName>_API_PVVIH`
- Profil : `dev`
- Fichier chargé : `<ServiceName>_API_PVVIH-dev.properties`

## Déploiement

### Déploiement Complet

Pour déployer l'ensemble du système :

```powershell
.\deploy-and-verify.ps1
```

Ce script :
1. Arrête les services existants
2. Reconstruit le Config Server
3. Démarre tous les services
4. Attend que le Config Server clone le dépôt GitHub
5. Vérifie que toutes les configurations sont disponibles
6. Redémarre les microservices pour charger les configurations
7. Affiche l'état final du système

### Vérification de l'État

Pour vérifier rapidement l'état du système :

```powershell
.\check-system-status.ps1
```

Ce script vérifie :
- Docker est actif
- État de tous les conteneurs
- Config Server est accessible
- Configurations sont disponibles
- Eureka fonctionne
- Services sont enregistrés
- Gateway est actif
- Bases de données sont actives

### Commandes Manuelles

```bash
# Arrêter tous les services
docker-compose down

# Démarrer tous les services
docker-compose up -d

# Reconstruire et démarrer
docker-compose up -d --build

# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker logs api-configuration -f
docker logs forum-pvvih -f

# Redémarrer un service
docker-compose restart api-configuration

# Voir l'état des services
docker-compose ps
```

## Vérification des Configurations

### Tester le Config Server

```bash
# Vérifier la santé du Config Server
curl http://localhost:8888/actuator/health

# Tester les configurations de chaque service
curl http://localhost:8888/Forum_API_PVVIH/dev
curl http://localhost:8888/Patient_API_PVVIH/dev
curl http://localhost:8888/Reference_API_PVVIH/dev
curl http://localhost:8888/User_API_PVVIH/dev
curl http://localhost:8888/GETWAY_PVVIH/dev
```

### Vérifier Eureka

Ouvrir dans le navigateur : http://localhost:8761

Vous devriez voir tous les services enregistrés :
- FORUM_API_PVVIH
- PATIENT_API_PVVIH
- REFERENCE_API_PVVIH
- USER_API_PVVIH
- GETWAY_PVVIH

## Dépannage

### Problème : Config Server ne démarre pas

**Symptômes :**
- Le conteneur `api-configuration` redémarre en boucle
- Logs montrent des erreurs de connexion Git

**Solutions :**
1. Vérifier que le dépôt GitHub est accessible
2. Vérifier la connexion Internet
3. Vérifier les logs : `docker logs api-configuration`

### Problème : Configurations non trouvées

**Symptômes :**
- Services affichent "Could not resolve placeholder"
- Config Server retourne 404 pour les configurations

**Solutions :**
1. Vérifier que les fichiers existent dans GitHub
2. Vérifier les noms de fichiers (sensible à la casse)
3. Vérifier que le profil est correct (`dev`)
4. Forcer le rechargement : `docker-compose restart api-configuration`

### Problème : Services ne démarrent pas

**Symptômes :**
- Services redémarrent en boucle
- Logs montrent des erreurs de configuration

**Solutions :**
1. Vérifier que le Config Server est démarré et sain
2. Attendre que le Config Server clone le dépôt (peut prendre 30-60 secondes)
3. Vérifier les logs du service : `docker logs <service-name>`
4. Redémarrer le service : `docker-compose restart <service-name>`

### Problème : Services ne s'enregistrent pas dans Eureka

**Symptômes :**
- Services démarrent mais n'apparaissent pas dans Eureka
- Logs montrent des erreurs de connexion à Eureka

**Solutions :**
1. Vérifier qu'Eureka est démarré : `docker logs api-register`
2. Vérifier la configuration réseau Docker
3. Redémarrer les services : `docker-compose restart`

## Modification des Configurations

### Pour modifier une configuration :

1. **Modifier le fichier dans le dépôt Git local :**
   ```bash
   cd C:\Users\babac\cloud-config-repo\cloud-config-repo-enda
   # Modifier le fichier nécessaire
   ```

2. **Commiter et pousser vers GitHub :**
   ```bash
   git add .
   git commit -m "Mise à jour configuration"
   git push origin main
   ```

3. **Redémarrer le Config Server pour recharger :**
   ```bash
   docker-compose restart api-configuration
   ```

4. **Redémarrer les services concernés :**
   ```bash
   docker-compose restart forum-pvvih gestion-user gestion-patient gestion-reference gateway-pvvih
   ```

## Avantages de cette Configuration

1. **Centralisation** : Toutes les configurations au même endroit
2. **Versioning** : Historique des modifications via Git
3. **Sécurité** : Pas de configurations sensibles dans le code
4. **Flexibilité** : Changement de configuration sans rebuild
5. **Production-ready** : Architecture standard Spring Cloud

## URLs des Services

- **Eureka Dashboard** : http://localhost:8761
- **Config Server** : http://localhost:8888
- **API Gateway** : http://localhost:8080
- **Forum Service** : http://localhost:9092
- **User Service** : http://localhost:9089
- **Patient Service** : http://localhost:9091
- **Reference Service** : http://localhost:9090
- **Forum Frontend** : http://localhost:3001
- **Reference Frontend** : http://localhost:3002
- **User Frontend** : http://localhost:3003

## Prochaines Étapes

1. Exécuter `.\deploy-and-verify.ps1` pour déployer le système
2. Vérifier que tous les services démarrent correctement
3. Tester les endpoints via le Gateway
4. Vérifier les frontends dans le navigateur

## Support

Pour plus d'informations :
- Logs détaillés : `docker-compose logs -f`
- État du système : `.\check-system-status.ps1`
- Documentation Docker Compose : `docker-compose --help`
