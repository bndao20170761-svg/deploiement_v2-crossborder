# Correction des Problèmes DNS Docker

## Problème
Maven ne peut pas résoudre `repo.maven.apache.org` pendant la construction Docker, ce qui fait échouer tous les services Spring Boot.

## Cause Principale
Les conteneurs Docker ne peuvent pas résoudre les noms DNS, probablement à cause de :
1. Problèmes de configuration DNS de Docker Desktop
2. Réseau/pare-feu bloquant Maven Central
3. Serveur DNS qui ne répond pas

## Solutions (À Essayer dans l'Ordre)

### Solution 1 : Corriger la Configuration DNS de Docker (Recommandé)

```powershell
# Exécuter le script de correction DNS
.\fix-docker-dns.ps1

# Redémarrer Docker Desktop manuellement
# Puis reconstruire
docker-compose build --no-cache
```

### Solution 2 : Utiliser un Miroir Maven

```powershell
# Ajouter la configuration du miroir Maven
.\add-maven-mirror.ps1

# Mettre à jour les Dockerfiles pour utiliser les paramètres
.\update-dockerfiles-maven.ps1

# Reconstruire
docker-compose build --no-cache
```

### Solution 3 : Construire avec le Réseau Hôte

```powershell
# Construire en utilisant le réseau hôte (contourne le DNS Docker)
.\build-with-host-network.ps1
```

### Solution 4 : Correction Manuelle du DNS Docker Desktop

1. Ouvrir Docker Desktop
2. Aller dans Paramètres → Docker Engine
3. Ajouter la configuration DNS :

```json
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
```

4. Cliquer sur "Apply & Restart"
5. Reconstruire : `docker-compose build --no-cache`

### Solution 5 : Vérifier le Réseau Windows

```powershell
# Tester la résolution DNS
nslookup repo.maven.apache.org

# Vider le cache DNS
ipconfig /flushdns

# Réinitialiser le réseau
netsh winsock reset
netsh int ip reset
```

## Vérification

Après avoir appliqué les corrections :

```powershell
# Tester si Maven Central est accessible
docker run --rm maven:3.9-eclipse-temurin-17-alpine ping -c 3 repo.maven.apache.org

# Essayer de construire un service
docker-compose build --no-cache api-configuration

# Si réussi, construire tout
docker-compose build --no-cache
```

## Alternative : Construire Sans Docker

Si les problèmes DNS Docker persistent, construire les JARs localement :

```powershell
# Construire chaque projet Spring Boot
cd api_configuration/demo
mvn clean package -DskipTests

cd ../../api_register
mvn clean package -DskipTests

# ... répéter pour tous les services
```

Puis modifier les Dockerfiles pour copier uniquement les JARs pré-construits.

## Référence Rapide

| Problème | Commande |
|----------|----------|
| Corriger DNS | `.\fix-docker-dns.ps1` |
| Ajouter miroir Maven | `.\add-maven-mirror.ps1` |
| Construire avec corrections | `.\build-with-host-network.ps1` |
| Tester DNS | `docker run --rm maven:3.9-eclipse-temurin-17-alpine ping repo.maven.apache.org` |
| Reconstruction propre | `docker-compose build --no-cache` |

## Prochaines Étapes

Une fois les constructions réussies :
1. Démarrer les services : `docker-compose up -d`
2. Vérifier : `.\verify-setup.ps1`
3. Consulter les logs : `docker-compose logs -f`
