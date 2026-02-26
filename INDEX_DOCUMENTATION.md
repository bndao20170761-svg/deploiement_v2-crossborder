# 📚 Index de la Documentation - Système Microservices PVVIH

## 🎯 Par où commencer?

### Nouveau sur le projet?
1. Lisez `RESUME_FINAL.md` (2 minutes)
2. Suivez `QUICK_START.md` (5 minutes)
3. Démarrez le système!

### Besoin de comprendre la configuration?
1. `CONFIGURATION_FINALE.md` - Vue d'ensemble complète
2. `FRONTEND_BACKEND_COMMUNICATION.md` - Communication entre services
3. `MICROSERVICES_CONFIGURATION.md` - Configuration détaillée

### Prêt à déployer?
1. `DEPLOYMENT.md` - Guide de déploiement complet
2. `FINAL_CONFIGURATION_CHECKLIST.md` - Checklist avant déploiement

## 📖 Documentation par catégorie

### 🚀 Démarrage rapide
| Document | Description | Temps de lecture |
|----------|-------------|------------------|
| `RESUME_FINAL.md` | Résumé ultra-rapide | 2 min |
| `QUICK_START.md` | Démarrage en 5 minutes | 5 min |
| `README.md` | Documentation générale | 10 min |

### ⚙️ Configuration
| Document | Description | Temps de lecture |
|----------|-------------|------------------|
| `CONFIGURATION_FINALE.md` | Configuration complète | 15 min |
| `CORRECTIONS_FINALES_LOCALHOST.md` | ✨ Corrections localhost (session actuelle) | 10 min |
| `FRONTEND_BACKEND_COMMUNICATION.md` | Communication services | 10 min |
| `MICROSERVICES_CONFIGURATION.md` | Configuration microservices | 15 min |
| `LOCALHOST_CORRECTIONS_SUMMARY.md` | Résumé corrections localhost | 10 min |

### 🚢 Déploiement
| Document | Description | Temps de lecture |
|----------|-------------|------------------|
| `DEPLOYMENT.md` | Guide de déploiement | 20 min |
| `FINAL_CONFIGURATION_CHECKLIST.md` | Checklist complète | 10 min |
| `DOCKER_SETUP_SUMMARY.md` | Résumé Docker | 10 min |

## 🔧 Scripts disponibles

### Windows (PowerShell)
```powershell
.\start.ps1 [dev|prod]          # Démarrer le système
.\stop.ps1 [-Volumes]           # Arrêter le système
.\logs.ps1 [service-name]       # Voir les logs
.\health-check.ps1              # Vérifier la santé
.\verify-setup.ps1              # Vérifier l'installation
.\verify-configuration.ps1      # Vérifier la configuration
```

### Linux/macOS (Bash)
```bash
./start.sh [dev|prod]           # Démarrer le système
./stop.sh [--volumes]           # Arrêter le système
./logs.sh [service-name]        # Voir les logs
```

## 📊 Architecture du système

### Services
- **3 Frontends**: gestion_forum_front, a_reference_front, a_user_front
- **4 Backends**: Forum_PVVIH, gestion_user, gestion_reference, gestion_patient
- **3 Edge Services**: Getway_PVVIH, api_configuration, api_register
- **4 Bases de données**: MongoDB, MySQL (x3)

### Ports
| Service | Port | URL |
|---------|------|-----|
| Forum Frontend | 3001 | http://localhost:3001 |
| Reference Frontend | 3002 | http://localhost:3002 |
| User Frontend | 3003 | http://localhost:3003 |
| API Gateway | 8080 | http://localhost:8080 |
| Eureka | 8761 | http://localhost:8761 |
| Config Server | 8888 | http://localhost:8888 |

## 🎓 Guides par scénario

### Scénario 1: Premier démarrage
1. `RESUME_FINAL.md` - Comprendre ce qui a été fait
2. `QUICK_START.md` - Démarrer en 5 minutes
3. `.\verify-setup.ps1` - Vérifier l'installation
4. `.\start.ps1 dev` - Démarrer le système

### Scénario 2: Comprendre la configuration
1. `CONFIGURATION_FINALE.md` - Vue d'ensemble
2. `FRONTEND_BACKEND_COMMUNICATION.md` - Communication
3. `MICROSERVICES_CONFIGURATION.md` - Détails techniques

### Scénario 3: Déploiement en production
1. `FINAL_CONFIGURATION_CHECKLIST.md` - Checklist
2. `DEPLOYMENT.md` - Guide de déploiement
3. `.\start.ps1 prod` - Démarrer en production

### Scénario 4: Problèmes / Debugging
1. `DEPLOYMENT.md` - Section Troubleshooting
2. `.\logs.ps1` - Voir les logs
3. `.\health-check.ps1` - Vérifier la santé
4. `docker-compose ps` - État des services

### Scénario 5: Modifier la configuration
1. `FRONTEND_BACKEND_COMMUNICATION.md` - Comprendre la communication
2. `MICROSERVICES_CONFIGURATION.md` - Fichiers à modifier
3. `.\verify-configuration.ps1` - Vérifier les changements

## 🔍 Recherche rapide

### Comment faire pour...

**Démarrer le système?**
→ `QUICK_START.md` ou `.\start.ps1 dev`

**Voir les logs?**
→ `.\logs.ps1` ou `docker-compose logs -f`

**Arrêter le système?**
→ `.\stop.ps1` ou `docker-compose down`

**Vérifier que tout fonctionne?**
→ `.\health-check.ps1` ou `docker-compose ps`

**Comprendre pourquoi les frontends utilisent localhost?**
→ `FRONTEND_BACKEND_COMMUNICATION.md`

**Comprendre pourquoi les backends utilisent les noms Docker?**
→ `FRONTEND_BACKEND_COMMUNICATION.md`

**Modifier les ports?**
→ `docker-compose.yml` + `MICROSERVICES_CONFIGURATION.md`

**Ajouter un nouveau service?**
→ `MICROSERVICES_CONFIGURATION.md` + `DEPLOYMENT.md`

**Déployer en production?**
→ `DEPLOYMENT.md` + `FINAL_CONFIGURATION_CHECKLIST.md`

**Résoudre un problème?**
→ `DEPLOYMENT.md` (section Troubleshooting)

## 📝 Fichiers de configuration importants

### Docker
- `docker-compose.yml` - Configuration principale
- `docker-compose.dev.yml` - Override développement
- `docker-compose.prod.yml` - Override production
- `.env.example` - Template variables d'environnement
- `.dockerignore` - Fichiers à exclure

### Backend
- `*/src/main/resources/application.properties` - Config DB
- `*/src/main/resources/bootstrap.properties` - Config Eureka/Config
- `*/src/main/resources/feign.properties` - Config Feign
- `*/src/main/java/*/config/SecurityConfig.java` - Config CORS
- `Getway_PVVIH/src/main/resources/application.yaml` - Routes Gateway

### Frontend
- `*/src/config/api.js` - Configuration API centralisée
- `*/nginx.conf` - Configuration Nginx
- Variables d'env dans `docker-compose.yml`

## 🆘 Support

### En cas de problème

1. **Vérifier les logs**: `.\logs.ps1`
2. **Vérifier l'état**: `docker-compose ps`
3. **Consulter le troubleshooting**: `DEPLOYMENT.md`
4. **Vérifier la configuration**: `.\verify-configuration.ps1`

### Ressources externes

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation Spring Cloud](https://spring.io/projects/spring-cloud)
- [Documentation React](https://react.dev/)

## ✅ Checklist rapide

Avant de démarrer:
- [ ] Docker et Docker Compose installés
- [ ] Fichier .env créé
- [ ] Ports disponibles (3001-3003, 8080, 8761, 8888)
- [ ] 8GB RAM minimum
- [ ] 20GB espace disque

Après démarrage:
- [ ] Tous les services "Up" et "healthy"
- [ ] Eureka affiche tous les services
- [ ] Frontends accessibles
- [ ] Gateway répond
- [ ] Pas d'erreurs dans les logs

## 🎯 Résumé

| Besoin | Document | Action |
|--------|----------|--------|
| Démarrer rapidement | `QUICK_START.md` | `.\start.ps1 dev` |
| Comprendre la config | `CONFIGURATION_FINALE.md` | Lire |
| Déployer | `DEPLOYMENT.md` | Suivre le guide |
| Problème | `DEPLOYMENT.md` | Section Troubleshooting |
| Vérifier | `.\verify-configuration.ps1` | Exécuter |

---

**Bon développement! 🚀**

Pour commencer: `.\start.ps1 dev`
