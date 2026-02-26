# Guide de Déploiement - Système Microservices PVVIH

Ce guide détaille les étapes de déploiement du système microservices PVVIH avec Docker.

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation initiale](#installation-initiale)
3. [Configuration](#configuration)
4. [Déploiement](#déploiement)
5. [Vérification](#vérification)
6. [Maintenance](#maintenance)
7. [Troubleshooting](#troubleshooting)

## Prérequis

### Logiciels requis

- **Docker**: Version 20.10 ou supérieure
- **Docker Compose**: Version 2.0 ou supérieure
- **Git**: Pour cloner le repository

### Ressources système

- **CPU**: 4 cores minimum (8 cores recommandé)
- **RAM**: 8GB minimum (16GB recommandé)
- **Disque**: 20GB d'espace libre minimum
- **Réseau**: Connexion internet pour télécharger les images

### Installation de Docker

#### Windows

1. Télécharger Docker Desktop: https://www.docker.com/products/docker-desktop
2. Installer et redémarrer
3. Vérifier l'installation:
```powershell
docker --version
docker-compose --version
```

#### Linux

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Vérifier l'installation
docker --version
docker-compose --version
```

#### macOS

1. Télécharger Docker Desktop: https://www.docker.com/products/docker-desktop
2. Installer et redémarrer
3. Vérifier l'installation:
```bash
docker --version
docker-compose --version
```

## Installation initiale

### 1. Cloner le projet

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Vérifier la structure

```bash
# Windows
dir

# Linux/macOS
ls -la
```

Vous devriez voir:
- `docker-compose.yml`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `.env.example`
- Dossiers des services (Forum_PVVIH, gestion_user, etc.)

## Configuration

### 1. Créer le fichier .env

```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

### 2. Éditer les variables d'environnement

Ouvrez `.env` et configurez:

```env
# Profil Spring (dev ou prod)
SPRING_PROFILES_ACTIVE=dev

# Configuration des bases de données
FORUM_DB_URL=jdbc:postgresql://postgres:5432/forum_db
FORUM_DB_USER=postgres
FORUM_DB_PASSWORD=VotreMotDePasseSecurise123!

USER_DB_URL=jdbc:postgresql://postgres:5432/user_db
USER_DB_USER=postgres
USER_DB_PASSWORD=VotreMotDePasseSecurise123!

REFERENCE_DB_URL=jdbc:postgresql://postgres:5432/reference_db
REFERENCE_DB_USER=postgres
REFERENCE_DB_PASSWORD=VotreMotDePasseSecurise123!

PATIENT_DB_URL=jdbc:postgresql://postgres:5432/patient_db
PATIENT_DB_USER=postgres
PATIENT_DB_PASSWORD=VotreMotDePasseSecurise123!

# Sécurité
JWT_SECRET=VotreCleSecreteTresLongueEtComplexe123456789!

# Niveau de log
LOG_LEVEL=INFO
```

### 3. Vérifier les ports disponibles

Assurez-vous que ces ports sont libres:
- 3001, 3002, 3003 (Frontends)
- 8080 (Gateway)
- 8761 (Eureka)
- 8888 (Config Server)

```bash
# Windows
netstat -ano | findstr "8080"

# Linux/macOS
netstat -tulpn | grep 8080
```

## Déploiement

### Mode Développement

#### Windows

```powershell
# Utiliser le script PowerShell
.\start.ps1 dev

# Ou manuellement
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

#### Linux/macOS

```bash
# Utiliser le script bash
chmod +x start.sh
./start.sh dev

# Ou manuellement
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Mode Production

#### Windows

```powershell
# Utiliser le script PowerShell
.\start.ps1 prod

# Ou manuellement
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### Linux/macOS

```bash
# Utiliser le script bash
./start.sh prod

# Ou manuellement
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Première construction

La première construction peut prendre 10-20 minutes selon votre connexion internet.

```bash
# Suivre la progression
docker-compose logs -f
```

## Vérification

### 1. Vérifier l'état des conteneurs

```bash
docker-compose ps
```

Tous les services doivent être "Up" et "healthy".

### 2. Vérifier les health checks

#### Windows

```powershell
.\health-check.ps1
```

#### Linux/macOS

```bash
# API Gateway
curl http://localhost:8080/actuator/health

# Eureka
curl http://localhost:8761/actuator/health

# Config Server
curl http://localhost:8888/actuator/health
```

### 3. Accéder aux interfaces

Ouvrez votre navigateur:

- Forum: http://localhost:3001
- Reference: http://localhost:3002
- User: http://localhost:3003
- Eureka Dashboard: http://localhost:8761

### 4. Vérifier les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f gateway-pvvih

# Windows PowerShell
.\logs.ps1 gateway-pvvih
```

## Maintenance

### Arrêter le système

```bash
# Windows
.\stop.ps1

# Linux/macOS
./stop.sh

# Ou manuellement
docker-compose down
```

### Arrêter et supprimer les volumes

```bash
# Windows
.\stop.ps1 -Volumes

# Linux/macOS
./stop.sh --volumes

# Ou manuellement
docker-compose down -v
```

### Redémarrer un service

```bash
docker-compose restart gateway-pvvih
```

### Reconstruire un service

```bash
# Reconstruire
docker-compose build gateway-pvvih

# Reconstruire et redémarrer
docker-compose up -d --build gateway-pvvih
```

### Mettre à jour le code

```bash
# 1. Arrêter les services
docker-compose down

# 2. Récupérer les mises à jour
git pull

# 3. Reconstruire les images
docker-compose build

# 4. Redémarrer
docker-compose up -d
```

### Backup des volumes

```bash
# Créer un backup
docker run --rm -v pvvih_config-data:/data -v $(pwd):/backup alpine tar czf /backup/config-backup.tar.gz /data

# Restaurer un backup
docker run --rm -v pvvih_config-data:/data -v $(pwd):/backup alpine tar xzf /backup/config-backup.tar.gz -C /
```

### Nettoyer Docker

```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune -a

# Nettoyer tout (ATTENTION: supprime tout)
docker system prune -a --volumes
```

## Troubleshooting

### Problème: Service ne démarre pas

**Symptômes**: Un service reste en état "starting" ou "unhealthy"

**Solutions**:

1. Vérifier les logs:
```bash
docker-compose logs service-name
```

2. Vérifier les ressources:
```bash
docker stats
```

3. Augmenter les limites de mémoire dans `docker-compose.yml`

4. Redémarrer le service:
```bash
docker-compose restart service-name
```

### Problème: Port déjà utilisé

**Symptômes**: Erreur "port is already allocated"

**Solutions**:

1. Identifier le processus:
```bash
# Windows
netstat -ano | findstr "8080"

# Linux/macOS
lsof -i :8080
```

2. Arrêter le processus ou changer le port dans `docker-compose.yml`

### Problème: Erreur de connexion entre services

**Symptômes**: Services ne peuvent pas communiquer

**Solutions**:

1. Vérifier le réseau:
```bash
docker network ls
docker network inspect pvvih-network
```

2. Recréer le réseau:
```bash
docker-compose down
docker network prune
docker-compose up -d
```

### Problème: Manque d'espace disque

**Symptômes**: Erreur "no space left on device"

**Solutions**:

1. Vérifier l'espace:
```bash
df -h
```

2. Nettoyer Docker:
```bash
docker system prune -a --volumes
```

### Problème: Build échoue

**Symptômes**: Erreur pendant `docker-compose build`

**Solutions**:

1. Nettoyer le cache:
```bash
docker-compose build --no-cache
```

2. Vérifier la connexion internet

3. Vérifier les Dockerfiles pour des erreurs

### Problème: Service Registry ne fonctionne pas

**Symptômes**: Services ne s'enregistrent pas dans Eureka

**Solutions**:

1. Vérifier qu'Eureka est démarré:
```bash
curl http://localhost:8761/actuator/health
```

2. Vérifier les variables d'environnement:
```bash
docker-compose exec service-name env | grep EUREKA
```

3. Redémarrer dans l'ordre:
```bash
docker-compose restart api-register
sleep 30
docker-compose restart api-configuration
sleep 30
docker-compose restart gateway-pvvih
```

### Obtenir de l'aide

Si les problèmes persistent:

1. Collecter les informations:
```bash
docker-compose ps
docker-compose logs > logs.txt
docker version
docker-compose version
```

2. Consulter la documentation des services individuels

3. Contacter le support technique

## Checklist de déploiement

- [ ] Docker et Docker Compose installés
- [ ] Ressources système suffisantes
- [ ] Ports disponibles
- [ ] Fichier .env configuré
- [ ] Variables d'environnement vérifiées
- [ ] Services construits avec succès
- [ ] Tous les services "healthy"
- [ ] Health checks passent
- [ ] Interfaces web accessibles
- [ ] Logs sans erreurs critiques
- [ ] Backup configuré (production)
- [ ] Monitoring configuré (production)

## Ressources supplémentaires

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation Spring Cloud](https://spring.io/projects/spring-cloud)
- [Documentation Eureka](https://cloud.spring.io/spring-cloud-netflix/)

## Support

Pour toute question ou problème, consultez:
- README.md
- Logs des services
- Documentation officielle
