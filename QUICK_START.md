# 🚀 Démarrage Rapide - 5 Minutes

## Étape 1: Vérifier les prérequis (1 min)

```powershell
# Vérifier Docker
docker --version
# Doit afficher: Docker version 20.10+

# Vérifier Docker Compose
docker-compose --version
# Doit afficher: Docker Compose version 2.0+
```

Si Docker n'est pas installé: https://www.docker.com/products/docker-desktop

## Étape 2: Configuration (2 min)

```powershell
# 1. Créer le fichier de configuration
copy .env.example .env

# 2. Éditer .env (optionnel pour un test rapide)
# Les valeurs par défaut fonctionnent pour un test local
notepad .env
```

**Valeurs minimales à vérifier dans .env:**
```env
SPRING_PROFILES_ACTIVE=dev
FORUM_DB_PASSWORD=postgres
USER_DB_PASSWORD=postgres
REFERENCE_DB_PASSWORD=postgres
PATIENT_DB_PASSWORD=postgres
```

## Étape 3: Démarrage (2 min)

```powershell
# Démarrer le système en mode développement
.\start.ps1 dev
```

**Attendez environ 2-3 minutes** que tous les services démarrent.

## Étape 4: Vérification (30 sec)

```powershell
# Vérifier l'état des services
docker-compose ps

# Vérifier la santé
.\health-check.ps1
```

Tous les services doivent être "Up" et "healthy".

## Étape 5: Accès aux interfaces

Ouvrez votre navigateur:

- **Forum**: http://localhost:3001
- **Reference**: http://localhost:3002
- **User**: http://localhost:3003
- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8080

## 🎉 C'est tout!

Votre système microservices est maintenant opérationnel!

## Commandes utiles

```powershell
# Voir les logs
.\logs.ps1

# Voir les logs d'un service spécifique
.\logs.ps1 gateway-pvvih

# Arrêter le système
.\stop.ps1

# Redémarrer
docker-compose restart
```

## En cas de problème

### Problème: Port déjà utilisé

```powershell
# Trouver le processus qui utilise le port 8080
netstat -ano | findstr "8080"

# Arrêter le processus ou changer le port dans docker-compose.yml
```

### Problème: Service ne démarre pas

```powershell
# Voir les logs du service
docker-compose logs service-name

# Redémarrer le service
docker-compose restart service-name
```

### Problème: Manque de mémoire

```powershell
# Vérifier les ressources
docker stats

# Augmenter la mémoire allouée à Docker Desktop:
# Settings > Resources > Memory > 8GB minimum
```

## Prochaines étapes

1. **Lire la documentation complète**: `README.md`
2. **Guide de déploiement détaillé**: `DEPLOYMENT.md`
3. **Résumé de la configuration**: `DOCKER_SETUP_SUMMARY.md`

## Support

- Consulter `DEPLOYMENT.md` section Troubleshooting
- Vérifier les logs: `.\logs.ps1`
- Vérifier l'état: `docker-compose ps`

---

**Bon développement! 🎯**
