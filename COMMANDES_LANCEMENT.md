# Guide de Lancement des Services Docker

## 🚀 Lancer gestion-reference Uniquement

### Commande Simple
```cmd
docker-compose up -d gestion-reference
```

### Avec Script PowerShell
```powershell
.\lancer-gestion-reference.ps1
```

## 🎯 Lancer Tous les Services

### Commande Simple
```cmd
docker-compose up -d
```

### Avec Script PowerShell (Recommandé)
```powershell
.\lancer-tous-services.ps1
```

Le script lance les services dans le bon ordre avec des temps d'attente appropriés.

## 📋 Commandes de Base

### Lancer un Service Spécifique
```cmd
docker-compose up -d <nom-du-service>
```

Exemples :
```cmd
docker-compose up -d gestion-reference
docker-compose up -d gateway-pvvih
docker-compose up -d a-reference-front
```

### Lancer Plusieurs Services
```cmd
docker-compose up -d gestion-reference gestion-user gateway-pvvih
```

### Lancer Tous les Services Backend
```cmd
docker-compose up -d api-configuration api-register gateway-pvvih gestion-reference gestion-patient gestion-user forum-pvvih
```

### Lancer Tous les Services Frontend
```cmd
docker-compose up -d a-reference-front a-user-front gestion-forum-front
```

## 🔄 Redémarrer les Services

### Redémarrer un Service
```cmd
docker-compose restart gestion-reference
```

### Redémarrer Tous les Services
```cmd
docker-compose restart
```

### Redémarrer avec Reconstruction
```cmd
docker-compose up -d --force-recreate gestion-reference
```

## 🛑 Arrêter les Services

### Arrêter un Service
```cmd
docker-compose stop gestion-reference
```

### Arrêter Tous les Services
```cmd
docker-compose stop
```

### Arrêter et Supprimer les Conteneurs
```cmd
docker-compose down
```

### Arrêter et Supprimer Tout (Conteneurs + Volumes + Réseaux)
```cmd
docker-compose down -v
```

## 📊 Vérifier l'État des Services

### Voir Tous les Services
```cmd
docker-compose ps
```

### Voir un Service Spécifique
```cmd
docker-compose ps gestion-reference
```

### Voir les Services en Cours d'Exécution
```cmd
docker-compose ps --services --filter "status=running"
```

### Voir les Statistiques en Temps Réel
```cmd
docker stats
```

## 📝 Voir les Logs

### Logs d'un Service
```cmd
# En temps réel
docker-compose logs -f gestion-reference

# Dernières 100 lignes
docker-compose logs --tail=100 gestion-reference
```

### Logs de Tous les Services
```cmd
docker-compose logs -f
```

## 🔧 Ordre de Démarrage Recommandé

Pour un démarrage optimal, lancez les services dans cet ordre :

1. **Serveur de Configuration** (api-configuration)
   ```cmd
   docker-compose up -d api-configuration
   ```
   Attendre 10-15 secondes

2. **Serveur Eureka** (api-register)
   ```cmd
   docker-compose up -d api-register
   ```
   Attendre 10-15 secondes

3. **Gateway** (gateway-pvvih)
   ```cmd
   docker-compose up -d gateway-pvvih
   ```
   Attendre 10 secondes

4. **Services Métier** (tous en même temps)
   ```cmd
   docker-compose up -d gestion-reference gestion-patient gestion-user forum-pvvih
   ```
   Attendre 5 secondes

5. **Services Frontend** (tous en même temps)
   ```cmd
   docker-compose up -d a-reference-front a-user-front gestion-forum-front
   ```

## 🎯 Scénarios Courants

### Démarrage Complet du Système
```cmd
# Option 1 : Tout en une fois
docker-compose up -d

# Option 2 : Avec script (recommandé)
.\lancer-tous-services.ps1
```

### Redémarrer Après Modification du Code
```cmd
# 1. Reconstruire l'image
docker-compose build gestion-reference

# 2. Redémarrer le service
docker-compose up -d --force-recreate gestion-reference

# 3. Voir les logs
docker-compose logs -f gestion-reference
```

### Déboguer un Service qui ne Démarre Pas
```cmd
# 1. Arrêter le service
docker-compose stop gestion-reference

# 2. Supprimer le conteneur
docker-compose rm -f gestion-reference

# 3. Relancer en mode interactif (voir les logs en direct)
docker-compose up gestion-reference

# 4. Ou relancer en arrière-plan et suivre les logs
docker-compose up -d gestion-reference
docker-compose logs -f gestion-reference
```

### Mise à Jour d'un Service
```cmd
# 1. Arrêter le service
docker-compose stop gestion-reference

# 2. Reconstruire
docker-compose build --no-cache gestion-reference

# 3. Relancer
docker-compose up -d gestion-reference

# 4. Vérifier
docker-compose ps gestion-reference
docker-compose logs -f gestion-reference
```

## 🔍 Vérification Après Lancement

### Vérifier que Tous les Services Sont UP
```cmd
docker-compose ps
```

Vous devriez voir tous les services avec l'état "Up".

### Vérifier les Ports
```cmd
netstat -ano | findstr "3000"
netstat -ano | findstr "8888"
netstat -ano | findstr "8761"
```

### Tester les Endpoints

#### Frontend
```cmd
# Ouvrir dans le navigateur
start http://localhost:3000
start http://localhost:3001
start http://localhost:3002
```

#### Backend
```cmd
# Avec curl (si installé)
curl http://localhost:8888/actuator/health
curl http://localhost:8761

# Ou avec PowerShell
Invoke-WebRequest -Uri http://localhost:8888/actuator/health
Invoke-WebRequest -Uri http://localhost:8761
```

## 🛠️ Scripts PowerShell Disponibles

### Lancer gestion-reference
```powershell
.\lancer-gestion-reference.ps1
```

### Lancer Tous les Services
```powershell
.\lancer-tous-services.ps1
```

### Voir les Logs
```powershell
.\voir-logs.ps1
```

### Vérifier la Configuration
```powershell
.\verify-setup.ps1
```

## 📊 Tableau de Référence Rapide

| Action | Commande |
|--------|----------|
| Lancer un service | `docker-compose up -d <service>` |
| Lancer tous | `docker-compose up -d` |
| Arrêter un service | `docker-compose stop <service>` |
| Arrêter tous | `docker-compose down` |
| Redémarrer | `docker-compose restart <service>` |
| Voir l'état | `docker-compose ps` |
| Voir les logs | `docker-compose logs -f <service>` |
| Reconstruire | `docker-compose build <service>` |
| Forcer recréation | `docker-compose up -d --force-recreate <service>` |

## 🚨 Résolution de Problèmes

### Le Service ne Démarre Pas
```cmd
# 1. Voir les logs
docker-compose logs gestion-reference

# 2. Vérifier l'image
docker images | findstr gestion-reference

# 3. Reconstruire si nécessaire
docker-compose build --no-cache gestion-reference

# 4. Relancer
docker-compose up -d gestion-reference
```

### Port Déjà Utilisé
```cmd
# Trouver le processus qui utilise le port
netstat -ano | findstr "8080"

# Arrêter le service Docker
docker-compose stop gestion-reference

# Ou changer le port dans docker-compose.yml
```

### Service en État "Restarting"
```cmd
# Voir les logs pour comprendre pourquoi
docker-compose logs --tail=100 gestion-reference

# Arrêter et supprimer
docker-compose stop gestion-reference
docker-compose rm -f gestion-reference

# Relancer
docker-compose up -d gestion-reference
```

## 💡 Bonnes Pratiques

1. **Toujours vérifier l'état après le lancement**
   ```cmd
   docker-compose ps
   ```

2. **Suivre les logs pendant le démarrage**
   ```cmd
   docker-compose logs -f gestion-reference
   ```

3. **Attendre que les services critiques soient prêts**
   - Config Server : 10-15 secondes
   - Eureka : 10-15 secondes
   - Gateway : 10 secondes

4. **Utiliser les scripts PowerShell pour un démarrage automatisé**
   ```powershell
   .\lancer-tous-services.ps1
   ```

5. **Vérifier la santé des services**
   ```cmd
   .\verify-setup.ps1
   ```

## 🎯 Commande Complète de Démarrage

Pour un démarrage complet et vérifié :

```powershell
# 1. Lancer tous les services
.\lancer-tous-services.ps1

# 2. Attendre 30 secondes

# 3. Vérifier
.\verify-setup.ps1

# 4. Voir les logs si nécessaire
.\voir-logs.ps1
```

Ou en une seule commande CMD :
```cmd
docker-compose up -d && timeout /t 30 && docker-compose ps
```
