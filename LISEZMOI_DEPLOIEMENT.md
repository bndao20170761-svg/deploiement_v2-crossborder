# Guide de Déploiement - Microservices PVVIH

## 🚀 Démarrage Rapide

Pour déployer l'ensemble du système en une seule commande :

```powershell
.\deploy-and-verify.ps1
```

Ce script va :
- ✅ Arrêter les services existants
- ✅ Reconstruire le Config Server
- ✅ Démarrer tous les services
- ✅ Vérifier que les configurations sont chargées depuis GitHub
- ✅ Redémarrer les microservices
- ✅ Afficher l'état final

## 📋 Prérequis

1. **Docker Desktop** installé et en cours d'exécution
2. **Connexion Internet** (pour cloner le dépôt GitHub)
3. **Ports disponibles** : 8080, 8761, 8888, 9089-9092, 3001-3003, 27017, 3307-3309

## 🔧 Configuration

Le système utilise le dépôt GitHub pour les configurations :
- **Dépôt** : https://github.com/BabacarNdaoKgl/cloud-config-repo-enda
- **Branche** : main
- **Profil** : dev

Les fichiers de configuration sont automatiquement chargés depuis GitHub au démarrage du Config Server.

## 📊 Vérification de l'État

Pour vérifier rapidement l'état du système :

```powershell
.\check-system-status.ps1
```

## 🌐 URLs des Services

### Services Backend
- **Eureka (Service Registry)** : http://localhost:8761
- **Config Server** : http://localhost:8888
- **API Gateway** : http://localhost:8080

### Microservices
- **Forum Service** : http://localhost:9092
- **User Service** : http://localhost:9089
- **Patient Service** : http://localhost:9091
- **Reference Service** : http://localhost:9090

### Frontends
- **Forum Frontend** : http://localhost:3001
- **Reference Frontend** : http://localhost:3002
- **User Frontend** : http://localhost:3003

## 🛠️ Commandes Utiles

### Gestion des Services

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart <nom-service>

# Voir l'état des services
docker-compose ps
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

### Reconstruction

```bash
# Reconstruire tous les services
docker-compose build

# Reconstruire un service spécifique
docker-compose build <nom-service>

# Reconstruire et démarrer
docker-compose up -d --build
```

## 🔍 Dépannage

### Le Config Server ne démarre pas

```bash
# Vérifier les logs
docker logs api-configuration

# Redémarrer le service
docker-compose restart api-configuration
```

### Un microservice ne démarre pas

```bash
# Vérifier les logs
docker logs <nom-service>

# Vérifier que le Config Server est actif
curl http://localhost:8888/actuator/health

# Redémarrer le service
docker-compose restart <nom-service>
```

### Les services ne s'enregistrent pas dans Eureka

```bash
# Vérifier Eureka
curl http://localhost:8761

# Redémarrer tous les services
docker-compose restart
```

### Erreur "Could not resolve placeholder"

Cela signifie que le service ne peut pas charger sa configuration.

**Solutions :**
1. Vérifier que le Config Server est actif
2. Vérifier que les fichiers existent dans GitHub
3. Attendre 30-60 secondes que le Config Server clone le dépôt
4. Redémarrer le service concerné

## 📝 Modification des Configurations

1. **Modifier le fichier dans votre dépôt Git local :**
   ```bash
   cd C:\Users\babac\cloud-config-repo\cloud-config-repo-enda
   # Modifier le fichier
   ```

2. **Pousser vers GitHub :**
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

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **CONFIGURATION_FINALE_GITHUB.md** : Documentation technique complète
- **docker-compose.yml** : Configuration des services

## ✅ Checklist de Déploiement

- [ ] Docker Desktop est démarré
- [ ] Connexion Internet active
- [ ] Ports nécessaires disponibles
- [ ] Exécuter `.\deploy-and-verify.ps1`
- [ ] Vérifier Eureka : http://localhost:8761
- [ ] Vérifier Gateway : http://localhost:8080
- [ ] Tester les frontends

## 🆘 Besoin d'Aide ?

1. Exécuter `.\check-system-status.ps1` pour diagnostiquer
2. Consulter les logs : `docker-compose logs -f`
3. Vérifier la documentation : `CONFIGURATION_FINALE_GITHUB.md`

## 🎯 Ordre de Démarrage

Le docker-compose gère automatiquement l'ordre de démarrage :

1. **Bases de données** (MongoDB, MySQL)
2. **Eureka** (Service Registry)
3. **Config Server** (charge depuis GitHub)
4. **Gateway** (API Gateway)
5. **Microservices** (Forum, User, Patient, Reference)
6. **Frontends** (React applications)

Chaque service attend que ses dépendances soient saines avant de démarrer (healthcheck).
