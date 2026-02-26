# Système de Microservices PVVIH

## 🚀 Démarrage Rapide

### Étape 1 : Vérifier la configuration GitHub

```powershell
.\verify-github-config.ps1
```

Ce script vérifie que tous les fichiers de configuration sont présents dans votre dépôt Git local et synchronisés avec GitHub.

### Étape 2 : Déployer le système

```powershell
.\deploy-and-verify.ps1
```

Ce script déploie automatiquement tous les services et vérifie que tout fonctionne correctement.

### Étape 3 : Vérifier l'état

```powershell
.\check-system-status.ps1
```

## 📋 Architecture

Le système utilise une architecture microservices avec :

### Services Edge
- **api-register** (Port 8761) : Service Registry Eureka pour la découverte de services
- **api-configuration** (Port 8888) : Serveur de configuration centralisé (charge depuis GitHub)
- **gateway-pvvih** (Port 8080) : API Gateway pour le routage des requêtes

### Microservices Backend
- **forum-pvvih** (Port 9092) : Service de gestion du forum
- **gestion-user** (Port 9089) : Service de gestion des utilisateurs, médecins, hôpitaux
- **gestion-patient** (Port 9091) : Service de gestion des dossiers patients
- **gestion-reference** (Port 9090) : Service de gestion des références médicales

### Frontends React
- **gestion-forum-front** (Port 3001) : Interface du forum
- **a-reference-front** (Port 3002) : Interface de référencement
- **a-user-front** (Port 3003) : Interface de gestion des utilisateurs

### Bases de Données
- **mongodb** (Port 27017) : Base de données pour le service Forum
- **mysql-user** (Port 3307) : Base de données pour le service User
- **mysql-patient** (Port 3309) : Base de données pour le service Patient
- **mysql-reference** (Port 3308) : Base de données pour le service Reference

## 🔧 Configuration

Les configurations sont centralisées dans un dépôt GitHub :
- **Dépôt GitHub** : https://github.com/BabacarNdaoKgl/cloud-config-repo-enda
- **Dépôt local** : C:\Users\babac\cloud-config-repo\cloud-config-repo-enda
- **Branche** : main
- **Profil** : dev

Le Config Server clone automatiquement le dépôt GitHub au démarrage et sert les configurations aux microservices.

## 📚 Documentation

- **LISEZMOI_DEPLOIEMENT.md** : Guide de déploiement complet en français
- **CONFIGURATION_FINALE_GITHUB.md** : Documentation technique détaillée
- **docker-compose.yml** : Configuration des services Docker

## 🌐 URLs des Services

### Services Backend
- **Eureka Dashboard** : http://localhost:8761
- **Config Server** : http://localhost:8888
- **API Gateway** : http://localhost:8080

### Microservices (accès direct)
- **Forum Service** : http://localhost:9092
- **User Service** : http://localhost:9089
- **Patient Service** : http://localhost:9091
- **Reference Service** : http://localhost:9090

### Frontends
- **Forum Frontend** : http://localhost:3001
- **Reference Frontend** : http://localhost:3002
- **User Frontend** : http://localhost:3003

## 🛠️ Commandes Utiles

### Démarrage et Arrêt

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer tous les services
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart <nom-service>
```

### Consultation des Logs

```bash
# Tous les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker logs <nom-service> -f

# Exemples
docker logs api-configuration -f
docker logs forum-pvvih -f
docker logs gateway-pvvih -f
```

### État et Diagnostic

```bash
# Voir l'état de tous les services
docker-compose ps

# Vérifier l'état du système
.\check-system-status.ps1

# Tester les configurations
.\test-config-endpoints.ps1
```

## 📝 Scripts PowerShell Disponibles

- **verify-github-config.ps1** : Vérifier que les fichiers de configuration sont présents dans GitHub
- **deploy-and-verify.ps1** : Déploiement complet automatisé avec vérifications
- **check-system-status.ps1** : Vérification complète de l'état du système
- **test-config-endpoints.ps1** : Tester les endpoints de configuration du Config Server

## 🔍 Dépannage

### Le Config Server ne démarre pas

```bash
# Vérifier les logs
docker logs api-configuration

# Vérifier la connexion GitHub
.\verify-github-config.ps1

# Redémarrer le service
docker-compose restart api-configuration
```

### Un microservice affiche "Could not resolve placeholder"

Cela signifie que le service ne peut pas charger sa configuration depuis le Config Server.

**Solutions :**
1. Vérifier que le Config Server est actif : `curl http://localhost:8888/actuator/health`
2. Attendre 30-60 secondes que le Config Server clone le dépôt GitHub
3. Vérifier que les fichiers existent dans GitHub : `.\verify-github-config.ps1`
4. Redémarrer le service : `docker-compose restart <nom-service>`

### Les services ne s'enregistrent pas dans Eureka

```bash
# Vérifier Eureka
curl http://localhost:8761

# Vérifier les logs
docker logs api-register

# Redémarrer tous les services
docker-compose restart
```

## 📦 Prérequis

- **Docker Desktop** installé et en cours d'exécution
- **Connexion Internet** (pour cloner le dépôt GitHub)
- **Ports disponibles** : 8080, 8761, 8888, 9089-9092, 3001-3003, 27017, 3307-3309
- **Git** installé (pour gérer le dépôt de configuration)

## 🔄 Workflow de Développement

### Modifier une configuration

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

3. **Redémarrer le Config Server :**
   ```bash
   docker-compose restart api-configuration
   ```

4. **Redémarrer les services concernés :**
   ```bash
   docker-compose restart forum-pvvih gestion-user gestion-patient gestion-reference gateway-pvvih
   ```

## ✅ Checklist de Déploiement

- [ ] Docker Desktop est démarré
- [ ] Connexion Internet active
- [ ] Ports nécessaires disponibles
- [ ] Fichiers de configuration présents dans GitHub (vérifier avec `.\verify-github-config.ps1`)
- [ ] Exécuter `.\deploy-and-verify.ps1`
- [ ] Vérifier Eureka : http://localhost:8761
- [ ] Vérifier Gateway : http://localhost:8080
- [ ] Tester les frontends

## 🆘 Support

Pour plus d'aide, consultez :
- **LISEZMOI_DEPLOIEMENT.md** : Guide complet en français
- **CONFIGURATION_FINALE_GITHUB.md** : Documentation technique
- Logs détaillés : `docker-compose logs -f`
- État du système : `.\check-system-status.ps1`

## 📄 Licence

Ce projet est développé pour la gestion des patients PVVIH dans le cadre du programme ENDA Santé.
