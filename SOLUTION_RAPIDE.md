# Solution Rapide - Problèmes Identifiés

## Problèmes trouvés dans vos logs

### 1. ❌ Base de données user_db non initialisée
```
Table 'user_db.users' doesn't exist
```
**Impact:** Le service gestion-user ne peut pas fonctionner

### 2. ❌ Problèmes de résolution DNS
```
java.net.UnknownHostException: api-register: Try again
```
**Impact:** Les services ne peuvent pas communiquer avec Eureka de manière stable

### 3. ⚠️ Variables d'environnement React manquantes
```
WARN The "REACT_APP_API_URL" variable is not set
```
**Impact:** Les frontends ne savent pas où contacter le backend

## Solution en 3 étapes

### Étape 1: Copier le script de correction sur votre VM

```bash
# Depuis votre machine locale
scp fix-deployment-gcp.sh babacarndao615@34.32.116.206:~/deploiement_v2-crossborder/
scp .env.example babacarndao615@34.32.116.206:~/deploiement_v2-crossborder/
```

### Étape 2: Se connecter à la VM et exécuter le script

```bash
# Connexion SSH
ssh babacarndao615@34.32.116.206

# Aller dans le répertoire
cd ~/deploiement_v2-crossborder

# Créer le fichier .env si nécessaire
cp .env.example .env
nano .env  # Modifiez l'IP si nécessaire

# Rendre le script exécutable
chmod +x fix-deployment-gcp.sh

# Exécuter le script
./fix-deployment-gcp.sh
```

### Étape 3: Vérifier que tout fonctionne

```bash
# Vérifier l'état des services
docker-compose ps

# Tous les services doivent être "healthy"

# Tester un endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123"}'

# Vous devriez voir une réponse (même si c'est une erreur 401, c'est bon signe!)
```

## Ce que fait le script de correction

1. ✅ Arrête tous les services proprement
2. ✅ Nettoie les conteneurs et réseaux
3. ✅ Crée le fichier .env avec toutes les variables nécessaires
4. ✅ Démarre les bases de données et attend leur initialisation
5. ✅ **Initialise la base user_db avec les tables nécessaires**
6. ✅ Démarre les services dans le bon ordre:
   - Bases de données → Eureka → Config Server → Gateway → Services métier → Frontends
7. ✅ Attend entre chaque étape pour assurer la stabilité
8. ✅ Vérifie que tout fonctionne

## Vérifications après correction

### 1. Vérifier que tous les services sont healthy

```bash
docker-compose ps
```

Vous devriez voir:
```
NAME                STATUS
api-register        Up (healthy)
api-configuration   Up (healthy)
gateway-pvvih       Up (healthy)
gestion-user        Up (healthy)
gestion-reference   Up (healthy)
gestion-patient     Up (healthy)
forum-pvvih         Up (healthy)
mongodb             Up (healthy)
mysql-user          Up (healthy)
mysql-reference     Up (healthy)
mysql-patient       Up (healthy)
```

### 2. Vérifier les services enregistrés dans Eureka

```bash
docker logs api-register 2>&1 | grep "registered with" | tail -10
```

Vous devriez voir:
- USER_API_PVVIH
- GETWAY_PVVIH
- REFERENCE_API_PVVIH
- PATIENT_API_PVVIH
- FORUM_API_PVVIH

### 3. Tester les endpoints via Postman

**Test 1: Health Check de la Gateway**
```
GET http://34.32.116.206:8080/actuator/health
```
Réponse attendue: `{"status":"UP"}`

**Test 2: Login (devrait retourner 401 ou 400)**
```
POST http://34.32.116.206:8080/api/auth/login
Content-Type: application/json

{
  "username": "test@test.com",
  "password": "test123"
}
```
Réponse attendue: Une erreur 401 ou 400 (c'est normal, l'utilisateur n'existe pas)

**Test 3: Register**
```
POST http://34.32.116.206:8080/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "nom": "Test",
  "prenom": "User",
  "profil": "PATIENT"
}
```

## Si les problèmes persistent

### Problème: Les services ne s'enregistrent pas dans Eureka

```bash
# Vérifier les logs de gestion-user
docker logs gestion-user 2>&1 | tail -50

# Chercher cette ligne:
# "Registered with Eureka"
```

**Solution:** Redémarrer le service
```bash
docker-compose restart gestion-user
sleep 30
docker logs gestion-user 2>&1 | grep "Eureka"
```

### Problème: La Gateway ne trouve pas les routes

```bash
# Vérifier que la Gateway a chargé sa configuration
docker logs gateway-pvvih 2>&1 | grep -i "config"

# Vérifier les routes
curl http://localhost:8080/actuator/gateway/routes
```

**Solution:** Vérifier que le fichier GETWAY_PVVIH-prod.yml existe dans votre repo GitHub

### Problème: Erreur de connexion à la base de données

```bash
# Vérifier que MySQL est accessible
docker exec gestion-user ping -c 3 mysql-user

# Tester la connexion MySQL
docker exec -it mysql-user mysql -uroot -proot123 -e "SHOW DATABASES;"
```

## Commandes utiles pour le diagnostic

```bash
# Voir tous les logs d'un service
docker logs <service-name>

# Suivre les logs en temps réel
docker logs -f gateway-pvvih

# Redémarrer un service spécifique
docker-compose restart <service-name>

# Voir l'utilisation des ressources
docker stats

# Inspecter le réseau
docker network inspect deploiement_v2-crossborder_pvvih-network
```

## Checklist finale

- [ ] Fichier .env créé avec toutes les variables
- [ ] Tous les conteneurs sont "healthy"
- [ ] Base user_db initialisée avec les tables
- [ ] Services enregistrés dans Eureka
- [ ] Gateway accessible sur le port 8080
- [ ] Endpoints répondent via Postman
- [ ] Pas d'erreurs "UnknownHostException" dans les logs
- [ ] Pas d'erreurs "Table doesn't exist" dans les logs

## Contact

Si après avoir suivi toutes ces étapes le problème persiste:
1. Exécutez: `./check-logs-gcp.sh > diagnostic.txt`
2. Partagez le fichier diagnostic.txt pour analyse approfondie
