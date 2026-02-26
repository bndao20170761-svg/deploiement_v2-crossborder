# Correction Erreur Docker 500 Internal Server Error

## 🔴 Erreur Rencontrée

```
request returned 500 Internal Server Error for API route
check if the server supports the requested API version
```

## 🎯 Cause du Problème

Cette erreur se produit quand :
1. Docker Desktop a un problème de communication interne
2. Le daemon Docker ne répond pas correctement
3. Docker Desktop est en cours de mise à jour ou redémarrage
4. Corruption temporaire de l'état Docker

## ✅ Solutions (Par Ordre de Priorité)

### Solution 1 : Redémarrer Docker Desktop (Recommandé)

#### Méthode Manuelle
1. **Clic droit** sur l'icône Docker dans la barre des tâches (en bas à droite)
2. Sélectionner **"Quit Docker Desktop"**
3. Attendre **10 secondes**
4. Relancer **Docker Desktop** depuis le menu Démarrer
5. Attendre que l'icône devienne **verte** (Docker est prêt)
6. Réessayer votre commande

#### Méthode Automatique (PowerShell)
```powershell
.\fix-docker-error.ps1
```

#### Méthode CMD
```cmd
# Arrêter Docker Desktop
taskkill /F /IM "Docker Desktop.exe"

# Attendre 10 secondes
timeout /t 10

# Relancer Docker Desktop
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Attendre que Docker soit prêt (vérifier l'icône)
```

### Solution 2 : Vérifier l'État de Docker

```cmd
# Tester si Docker répond
docker info

# Si ça fonctionne, réessayer votre commande
docker-compose restart gestion-reference
```

### Solution 3 : Utiliser Docker Directement

Au lieu de `docker-compose restart`, utilisez Docker directement :

```cmd
# Lister les conteneurs
docker ps -a

# Trouver le conteneur gestion-reference
docker ps -a | findstr gestion-reference

# Redémarrer avec Docker directement
docker restart vesion_2_enda_crossborder-gestion-reference-1
```

### Solution 4 : Arrêter et Relancer le Conteneur

```cmd
# Arrêter
docker-compose stop gestion-reference

# Attendre 5 secondes
timeout /t 5

# Relancer
docker-compose up -d gestion-reference
```

### Solution 5 : Nettoyer et Redémarrer

```cmd
# Arrêter tous les conteneurs
docker-compose down

# Attendre 5 secondes
timeout /t 5

# Relancer tous les services
docker-compose up -d
```

## 🔧 Vérifications Après Correction

### 1. Vérifier que Docker Fonctionne
```cmd
docker info
docker ps
```

### 2. Vérifier les Conteneurs
```cmd
docker-compose ps
```

### 3. Tester une Commande Simple
```cmd
docker run --rm hello-world
```

## 🚨 Si le Problème Persiste

### Option A : Redémarrer Windows
Parfois, un redémarrage complet de Windows résout les problèmes Docker.

### Option B : Réinitialiser Docker Desktop

1. Ouvrir Docker Desktop
2. Aller dans **Settings** (⚙️)
3. Aller dans **Troubleshoot**
4. Cliquer sur **"Reset to factory defaults"**
5. Confirmer et attendre la réinitialisation
6. Reconfigurer Docker si nécessaire

### Option C : Réinstaller Docker Desktop

Si rien ne fonctionne :
1. Désinstaller Docker Desktop
2. Redémarrer Windows
3. Télécharger la dernière version depuis [docker.com](https://www.docker.com/products/docker-desktop)
4. Installer et configurer

## 📋 Commandes Alternatives

Si `docker-compose restart` ne fonctionne pas, utilisez ces alternatives :

### Alternative 1 : Stop + Start
```cmd
docker-compose stop gestion-reference
docker-compose start gestion-reference
```

### Alternative 2 : Down + Up
```cmd
docker-compose down gestion-reference
docker-compose up -d gestion-reference
```

### Alternative 3 : Docker Directement
```cmd
# Trouver l'ID du conteneur
docker ps -a | findstr gestion-reference

# Redémarrer avec l'ID ou le nom
docker restart <container_id_ou_nom>
```

### Alternative 4 : Recréer le Conteneur
```cmd
docker-compose up -d --force-recreate gestion-reference
```

## 🎯 Procédure Complète de Récupération

Si vous avez cette erreur, suivez ces étapes dans l'ordre :

```powershell
# 1. Exécuter le script de correction
.\fix-docker-error.ps1

# 2. Attendre que Docker soit prêt (icône verte)

# 3. Vérifier que Docker fonctionne
docker info

# 4. Vérifier les conteneurs
docker-compose ps

# 5. Relancer votre service
docker-compose up -d gestion-reference

# 6. Vérifier les logs
docker-compose logs -f gestion-reference
```

## 💡 Prévention

Pour éviter ce problème à l'avenir :

1. **Ne pas arrêter Docker brutalement** - Toujours utiliser "Quit Docker Desktop"
2. **Attendre que Docker soit complètement démarré** avant d'exécuter des commandes
3. **Garder Docker Desktop à jour**
4. **Redémarrer Docker régulièrement** si vous l'utilisez intensivement
5. **Vérifier les ressources système** (RAM, CPU) - Docker a besoin de ressources

## 📊 Diagnostic Rapide

```cmd
# Vérifier l'état de Docker
docker info

# Vérifier les processus Docker
tasklist | findstr docker

# Vérifier les conteneurs
docker ps -a

# Vérifier les réseaux
docker network ls

# Vérifier les volumes
docker volume ls
```

## 🔍 Logs de Diagnostic

Si le problème persiste, collectez ces informations :

```cmd
# Logs Docker Desktop
# Aller dans Docker Desktop → Troubleshoot → Get support
# Ou consulter : %LOCALAPPDATA%\Docker\log.txt

# Version Docker
docker version

# Informations système
docker info

# Événements Docker
docker events --since 1h
```

## ✅ Résumé des Actions

| Action | Commande |
|--------|----------|
| Redémarrer Docker | `.\fix-docker-error.ps1` |
| Vérifier Docker | `docker info` |
| Lister conteneurs | `docker ps -a` |
| Redémarrer service | `docker restart <container>` |
| Alternative restart | `docker-compose stop && docker-compose start` |
| Recréer conteneur | `docker-compose up -d --force-recreate` |

## 🎯 Commande Rapide

Pour résoudre rapidement :

```powershell
# Tout en une commande
.\fix-docker-error.ps1 ; docker-compose up -d gestion-reference ; docker-compose logs -f gestion-reference
```

Ou en CMD :
```cmd
taskkill /F /IM "Docker Desktop.exe" && timeout /t 10 && start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

Puis attendre 30-60 secondes et réessayer votre commande.
