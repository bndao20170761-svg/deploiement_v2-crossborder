# 🚀 Référence Rapide - Système Microservices PVVIH

## ⚡ Commandes essentielles

### Démarrage
```powershell
# Développement
.\start.ps1 dev

# Production
.\start.ps1 prod

# Ou directement
docker-compose up -d
```

### Arrêt
```powershell
# Arrêt simple
.\stop.ps1

# Arrêt avec suppression des volumes
.\stop.ps1 -Volumes

# Ou directement
docker-compose down
docker-compose down -v  # Avec volumes
```

### Logs
```powershell
# Tous les services
.\logs.ps1

# Service spécifique
.\logs.ps1 gestion-user

# Ou directement
docker-compose logs -f
docker-compose logs -f gestion-user
```

### Vérification
```powershell
# État des services
docker-compose ps

# Santé des services
.\health-check.ps1

# Configuration
.\verify-configuration.ps1

# Corrections localhost
.\verify-localhost-corrections.ps1
```

## 🌐 URLs d'accès

### Frontends
| Service | URL | Description |
|---------|-----|-------------|
| Forum | http://localhost:3001 | Gestion du forum |
| Reference | http://localhost:3002 | Gestion des références |
| User | http://localhost:3003 | Gestion des utilisateurs |

### Infrastructure
| Service | URL | Description |
|---------|-----|-------------|
| Gateway | http://localhost:8080 | Point d'entrée API |
| Eureka | http://localhost:8761 | Service Registry |
| Config Server | http://localhost:8888 | Configuration centralisée |

### Bases de données (Debug)
| Service | Port | Credentials |
|---------|------|-------------|
| MongoDB | 27017 | admin/admin123 |
| MySQL User | 3307 | user_service/user123 |
| MySQL Reference | 3308 | reference_service/reference123 |
| MySQL Patient | 3309 | patient_service/patient123 |

## 🔧 Noms de services Docker

### Pour les backends (communication interne)
```java
// Eureka
http://api-register:8761/eureka/

// Config Server
http://api-configuration:8888

// Gateway
http://gateway-pvvih:8080

// Services métier
http://gestion-user:8080
http://gestion-reference:8080
http://gestion-patient:8080
http://forum-pvvih:8080

// Bases de données
mongodb://mongodb:27017
jdbc:mysql://mysql-user:3306/user_db
jdbc:mysql://mysql-reference:3306/reference_db
jdbc:mysql://mysql-patient:3306/patient_db
```

### Pour les frontends (accès depuis le navigateur)
```javascript
// Toujours utiliser localhost avec les ports EXTERNES
http://localhost:8080  // Gateway
http://localhost:3001  // Forum Frontend
http://localhost:3002  // Reference Frontend
http://localhost:3003  // User Frontend
```

## 📊 Architecture simplifiée

```
Navigateur
    ↓
localhost:8080 (Gateway)
    ↓
┌─────────────────────────────────┐
│   Réseau Docker: pvvih-network  │
│                                  │
│  gateway-pvvih:8080              │
│         ↓                        │
│  ┌──────┴──────┬──────┬──────┐  │
│  ↓             ↓      ↓      ↓  │
│ user      reference patient forum│
│  ↓             ↓      ↓      ↓  │
│ mysql-user mysql-ref mysql-pat mongodb│
└─────────────────────────────────┘
```

## 🔍 Troubleshooting rapide

### Service ne démarre pas
```powershell
# Voir les logs
docker-compose logs [service-name]

# Redémarrer le service
docker-compose restart [service-name]

# Reconstruire et redémarrer
docker-compose up -d --build [service-name]
```

### Problème de connexion
```powershell
# Vérifier la connectivité réseau
docker-compose exec gestion-user ping mongodb
docker-compose exec gestion-user ping api-register

# Vérifier les variables d'environnement
docker-compose exec gestion-user env | findstr DATASOURCE
docker-compose exec gestion-user env | findstr EUREKA
```

### Base de données
```powershell
# Vérifier que la DB est démarrée
docker-compose ps mongodb mysql-user mysql-reference mysql-patient

# Se connecter à la DB
docker-compose exec mongodb mongosh
docker-compose exec mysql-user mysql -u user_service -p
```

### Frontend ne peut pas accéder au backend
```powershell
# Vérifier que le gateway est démarré
docker-compose ps gateway-pvvih

# Tester l'accès au gateway
curl http://localhost:8080/actuator/health

# Vérifier les variables d'environnement du frontend
docker-compose exec gestion-forum-front env | findstr REACT_APP
```

## 📝 Fichiers de configuration clés

### Docker
- `docker-compose.yml` - Configuration principale
- `.env` - Variables d'environnement

### Backend
- `*/src/main/resources/bootstrap.properties` - Eureka & Config Server
- `*/src/main/resources/application.properties` - Database & App config
- `*/src/main/resources/feign.properties` - Feign clients
- `*/src/main/java/*/config/SecurityConfig.java` - CORS
- `Getway_PVVIH/src/main/resources/application.yaml` - Gateway routes

### Frontend
- `*/src/config/api.js` - Configuration API
- Variables d'env dans `docker-compose.yml`

## 📚 Documentation

### Démarrage rapide
- `RESUME_FINAL.md` - Résumé 2 min
- `QUICK_START.md` - Démarrage 5 min

### Configuration
- `CONFIGURATION_FINALE.md` - Vue complète
- `CORRECTIONS_FINALES_LOCALHOST.md` - Corrections effectuées
- `FRONTEND_BACKEND_COMMUNICATION.md` - Communication services

### Déploiement
- `DEPLOYMENT.md` - Guide complet
- `FINAL_CONFIGURATION_CHECKLIST.md` - Checklist

## ✅ Checklist avant démarrage

- [ ] Docker et Docker Compose installés
- [ ] Fichier `.env` créé (copier `.env.example`)
- [ ] Ports disponibles: 3001-3003, 8080, 8761, 8888, 27017, 3307-3309
- [ ] 8GB RAM minimum
- [ ] 20GB espace disque

## ✅ Checklist après démarrage

- [ ] Tous les services "Up" (healthy)
- [ ] Eureka affiche tous les services: http://localhost:8761
- [ ] Gateway répond: http://localhost:8080/actuator/health
- [ ] Frontends accessibles: 3001, 3002, 3003
- [ ] Pas d'erreurs dans les logs

## 🎯 Commandes Docker utiles

```powershell
# Voir tous les conteneurs
docker ps -a

# Voir les images
docker images

# Nettoyer les ressources inutilisées
docker system prune -a

# Voir l'utilisation des ressources
docker stats

# Inspecter un conteneur
docker inspect [container-name]

# Exécuter une commande dans un conteneur
docker-compose exec [service-name] [command]

# Copier un fichier depuis/vers un conteneur
docker cp [container-name]:/path/to/file ./local/path
docker cp ./local/file [container-name]:/path/to/file
```

## 🔐 Sécurité

### Credentials par défaut (à changer en production!)

**MongoDB:**
- Username: `admin`
- Password: `admin123`

**MySQL User:**
- Username: `user_service`
- Password: `user123`

**MySQL Reference:**
- Username: `reference_service`
- Password: `reference123`

**MySQL Patient:**
- Username: `patient_service`
- Password: `patient123`

**JWT Secret:**
- Défini dans chaque `application.properties`
- À changer en production!

## 🚨 En cas d'urgence

### Tout redémarrer
```powershell
.\stop.ps1 -Volumes
docker system prune -f
.\start.ps1 dev
```

### Reconstruire tout
```powershell
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Voir tous les logs
```powershell
docker-compose logs -f --tail=100
```

## 📞 Support

### Documentation
- Consultez `INDEX_DOCUMENTATION.md` pour la liste complète
- Lisez `DEPLOYMENT.md` section Troubleshooting

### Vérification
- Exécutez `.\verify-configuration.ps1`
- Exécutez `.\health-check.ps1`

---

**Pour démarrer maintenant:**
```powershell
.\start.ps1 dev
```

**Bon développement! 🚀**
