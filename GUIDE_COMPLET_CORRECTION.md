# Guide Complet de Correction - Problème DNS Docker

## 🔴 Problème Actuel

Lors de l'exécution de `docker-compose build --no-cache`, Maven ne peut pas télécharger les dépendances car il ne peut pas résoudre `repo.maven.apache.org`.

**Erreur typique :**
```
Could not transfer artifact ... from/to central (https://repo.maven.apache.org/maven2): 
repo.maven.apache.org: Name does not resolve
```

## 📋 Plan d'Action Recommandé

### Étape 1 : Correction DNS Docker (5 minutes)

```powershell
# 1. Exécuter le script de correction DNS
.\fix-docker-dns.ps1

# 2. Redémarrer Docker Desktop MANUELLEMENT
#    - Clic droit sur l'icône Docker dans la barre des tâches
#    - Sélectionner "Quit Docker Desktop"
#    - Attendre 10 secondes
#    - Relancer Docker Desktop

# 3. Attendre que Docker soit complètement démarré (icône verte)

# 4. Tester la résolution DNS
docker run --rm maven:3.9-eclipse-temurin-17-alpine ping -c 3 repo.maven.apache.org
```

**Si le ping fonctionne :** Passez à l'Étape 2
**Si le ping échoue :** Passez à l'Étape Alternative A

### Étape 2 : Construction avec Script Amélioré (15-20 minutes)

```powershell
# Construire tous les services avec gestion d'erreurs
.\build-with-host-network.ps1
```

Ce script va :
- Construire chaque service individuellement
- Afficher la progression
- Identifier les services qui échouent
- Fournir un résumé à la fin

**Si tous les services se construisent :** Passez à l'Étape 3
**Si certains échouent :** Passez à l'Étape Alternative B

### Étape 3 : Démarrage et Vérification

```powershell
# Démarrer tous les services
docker-compose up -d

# Vérifier l'état
docker-compose ps

# Consulter les logs
docker-compose logs -f
```

## 🔧 Étapes Alternatives

### Alternative A : Configuration Manuelle DNS Docker

Si le script automatique ne fonctionne pas :

1. **Ouvrir Docker Desktop**
2. **Cliquer sur l'icône ⚙️ (Settings)**
3. **Aller dans "Docker Engine"**
4. **Modifier la configuration JSON :**

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "experimental": false
}
```

5. **Cliquer sur "Apply & Restart"**
6. **Attendre le redémarrage complet**
7. **Retourner à l'Étape 1, point 4**

### Alternative B : Utiliser un Miroir Maven

Si Maven Central reste inaccessible :

```powershell
# 1. Créer les fichiers settings.xml pour Maven
.\add-maven-mirror.ps1

# 2. Mettre à jour les Dockerfiles
.\update-dockerfiles-maven.ps1

# 3. Reconstruire
docker-compose build --no-cache
```

### Alternative C : Vérifier le Réseau Windows

Si rien ne fonctionne, le problème peut venir de Windows :

```powershell
# 1. Vider le cache DNS Windows
ipconfig /flushdns

# 2. Tester la résolution DNS depuis Windows
nslookup repo.maven.apache.org

# 3. Si ça échoue, réinitialiser le réseau
netsh winsock reset
netsh int ip reset

# 4. Redémarrer l'ordinateur
# 5. Reprendre depuis l'Étape 1
```

### Alternative D : Construction Locale (Dernier Recours)

Si Docker DNS ne peut pas être résolu :

```powershell
# Construire les JARs localement sans Docker
cd api_configuration/demo
mvn clean package -DskipTests
cd ../..

cd api_register
mvn clean package -DskipTests
cd ..

cd forum_pvvih
mvn clean package -DskipTests
cd ..

cd gestion_patient
mvn clean package -DskipTests
cd ..

cd gestion_reference
mvn clean package -DskipTests
cd ..

cd gestion_user
mvn clean package -DskipTests
cd ..

cd Getway_PVVIH
mvn clean package -DskipTests
cd ..
```

Puis modifier les Dockerfiles pour copier les JARs pré-construits.

## 🔍 Diagnostic des Problèmes

### Vérifier si Docker fonctionne

```powershell
docker info
docker ps
```

### Vérifier la connectivité réseau Docker

```powershell
# Test ping depuis un conteneur
docker run --rm alpine ping -c 3 8.8.8.8

# Test résolution DNS depuis un conteneur
docker run --rm alpine nslookup repo.maven.apache.org
```

### Vérifier les logs Docker

```powershell
# Logs de construction d'un service spécifique
docker-compose build api-configuration 2>&1 | Tee-Object -FilePath build-log.txt

# Consulter le fichier build-log.txt pour plus de détails
```

## 📊 Tableau de Dépannage

| Symptôme | Cause Probable | Solution |
|----------|----------------|----------|
| "Name does not resolve" | DNS Docker mal configuré | Étape 1 ou Alternative A |
| "Connection timeout" | Pare-feu/Proxy | Vérifier pare-feu Windows |
| "Unknown host" | Problème réseau Windows | Alternative C |
| Builds très lents | Pas de cache Maven | Alternative B (miroir) |
| Erreurs aléatoires | Instabilité réseau | Alternative D (build local) |

## ✅ Checklist de Vérification

Avant de commencer :
- [ ] Docker Desktop est installé et démarré
- [ ] Vous avez les droits administrateur
- [ ] Votre connexion Internet fonctionne
- [ ] Aucun VPN actif (peut causer des problèmes)
- [ ] Pare-feu Windows autorise Docker

Après les corrections :
- [ ] `docker info` fonctionne
- [ ] Ping vers 8.8.8.8 fonctionne depuis un conteneur
- [ ] Résolution DNS fonctionne depuis un conteneur
- [ ] Au moins un service se construit avec succès
- [ ] Tous les services se construisent

## 🎯 Résultat Attendu

Après avoir suivi ce guide, vous devriez voir :

```powershell
PS> .\build-with-host-network.ps1

Building Docker images with host network...

========================================
Building: api-configuration
========================================
✓ api-configuration built successfully

========================================
Building: api-register
========================================
✓ api-register built successfully

[...]

========================================
Build Summary
========================================

Successfully built (10):
  ✓ api-configuration
  ✓ api-register
  ✓ gateway-pvvih
  ✓ gestion-reference
  ✓ gestion-patient
  ✓ gestion-user
  ✓ forum-pvvih
  ✓ a-reference-front
  ✓ a-user-front
  ✓ gestion-forum-front

✓ All services built successfully!

You can now start the services with:
docker-compose up -d
```

## 📞 Besoin d'Aide ?

Si vous êtes bloqué :
1. Consultez `CORRECTION_DNS_DOCKER.md` pour plus de détails
2. Vérifiez les logs : `docker-compose logs`
3. Testez service par service : `docker-compose build <service-name>`
4. Essayez l'Alternative D (construction locale)

## 🚀 Prochaines Étapes

Une fois tous les services construits :
1. Démarrer : `docker-compose up -d`
2. Vérifier : `docker-compose ps`
3. Tester : Ouvrir http://localhost:3000
4. Consulter : `.\verify-setup.ps1`
