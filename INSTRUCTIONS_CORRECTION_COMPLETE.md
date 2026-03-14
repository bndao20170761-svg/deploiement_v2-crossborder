# CORRECTION COMPLÈTE DU GATEWAY - ÉTAPES FINALES

## PROBLÈME IDENTIFIÉ
Les services dans Eureka utilisent des **underscores** (`USER_API_PVVIH`) mais la configuration GitHub du Gateway utilise des **hyphens** (`USER-API-PVVIH`).

## SERVICES ENREGISTRÉS DANS EUREKA (confirmé par vos logs)
```
✓ USER_API_PVVIH
✓ PATIENT_API_PVVIH  
✓ REFERENCE_API_PVVIH
✓ FORUM_API_PVVIH (probablement)
✓ GETWAY_PVVIH
```

## ÉTAPE 1: POUSSER LA CONFIGURATION CORRIGÉE SUR GITHUB

### 1.1 Aller sur GitHub
Ouvrez: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git

### 1.2 Modifier le fichier GETWAY_PVVIH-prod.yml
- Cliquez sur le fichier `GETWAY_PVVIH-prod.yml`
- Cliquez sur l'icône "Edit" (crayon)
- **SUPPRIMEZ TOUT LE CONTENU ACTUEL**
- **COPIEZ-COLLEZ** le contenu complet du fichier `GETWAY_PVVIH-prod-CORRIGE.yml` (voir ci-dessous)

### 1.3 Commit les changements
- Message de commit: "Fix: Correction noms services Eureka avec underscores"
- Cliquez sur "Commit changes"

## ÉTAPE 2: FORCER LE RECHARGEMENT SUR LA VM

### 2.1 Se connecter à la VM
```bash
gcloud compute ssh babacarndao615@instance-20260310-134136
cd ~/deploiement_v2-crossborder
```

### 2.2 Arrêter et supprimer les conteneurs (force cache refresh)
```bash
# Arrêter Gateway et Config Server
docker-compose stop gateway-pvvih api-configuration

# Supprimer les conteneurs (force le rechargement de la config)
docker-compose rm -f gateway-pvvih api-configuration

# Vérifier qu'ils sont bien supprimés
docker ps -a | grep -E "gateway-pvvih|api-configuration"
```

### 2.3 Redémarrer dans le bon ordre
```bash
# 1. Démarrer Config Server en premier
docker-compose up -d api-configuration

# 2. Attendre 20 secondes que Config Server charge la config depuis GitHub
echo "Attente 20 secondes pour Config Server..."
sleep 20

# 3. Vérifier que Config Server a bien chargé la nouvelle config
curl http://localhost:8888/GETWAY_PVVIH/prod | grep -i "USER_API_PVVIH"
# Vous DEVEZ voir "USER_API_PVVIH" avec underscores (pas hyphens)

# 4. Démarrer le Gateway
docker-compose up -d gateway-pvvih

# 5. Attendre 30 secondes que Gateway se connecte à Eureka
echo "Attente 30 secondes pour Gateway..."
sleep 30
```

### 2.4 Vérifier les logs du Gateway
```bash
# Voir les dernières lignes des logs
docker-compose logs --tail=50 gateway-pvvih

# Chercher les routes chargées (vous devez voir USER_API_PVVIH avec underscores)
docker-compose logs gateway-pvvih | grep -i "route\|USER_API"
```

## ÉTAPE 3: TESTER L'ENDPOINT

### 3.1 Vérifier que la route existe
```bash
# Voir toutes les routes du Gateway
curl http://localhost:8080/actuator/gateway/routes | jq '.'

# Chercher spécifiquement la route user-api-auth
curl http://localhost:8080/actuator/gateway/routes | jq '.[] | select(.route_id=="user-api-auth")'
```

### 3.2 Tester l'enregistrement depuis Postman
```
POST http://34.32.116.206:8080/api/auth/register
Content-Type: application/json

{
  "username": "test@test.com",
  "password": "test123",
  "nom": "Test",
  "prenom": "User",
  "nationalite": "Sénégal"
}
```

**Résultat attendu**: Code 200 ou 201 avec un token JWT

## ÉTAPE 4: SI ÇA NE MARCHE TOUJOURS PAS

### 4.1 Vérifier que gestion-user est bien démarré
```bash
docker-compose ps gestion-user
docker-compose logs --tail=30 gestion-user
```

### 4.2 Vérifier l'enregistrement dans Eureka
```bash
# Voir tous les services enregistrés
curl http://localhost:8761/eureka/apps | grep -i "application"

# Voir spécifiquement USER_API_PVVIH
curl http://localhost:8761/eureka/apps/USER_API_PVVIH
```

### 4.3 Tester directement le service (bypass Gateway)
```bash
# Trouver l'IP du conteneur gestion-user
docker inspect gestion-user | grep IPAddress

# Tester directement (remplacez 172.18.0.X par l'IP trouvée)
curl -X POST http://172.18.0.10:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123","nom":"Test","prenom":"User","nationalite":"Sénégal"}'
```

## RÉSUMÉ DES CHANGEMENTS CRITIQUES

### AVANT (incorrect - avec hyphens)
```yaml
- id: user-api-auth
  uri: lb://USER-API-PVVIH  # ❌ INCORRECT
```

### APRÈS (correct - avec underscores)
```yaml
- id: user-api-auth
  uri: lb://USER_API_PVVIH  # ✅ CORRECT
```

## POURQUOI ÇA NE MARCHAIT PAS

1. **Gateway cherchait**: `USER-API-PVVIH` (avec hyphens)
2. **Eureka avait**: `USER_API_PVVIH` (avec underscores)
3. **Résultat**: Gateway ne trouvait pas le service → 404 Not Found

## VÉRIFICATION FINALE

Après avoir suivi toutes les étapes, vous devriez voir:

```bash
# 1. Config Server retourne la bonne config
curl http://localhost:8888/GETWAY_PVVIH/prod | grep "USER_API_PVVIH"
# Résultat: doit contenir "USER_API_PVVIH" (underscores)

# 2. Gateway a chargé les routes
curl http://localhost:8080/actuator/gateway/routes | grep "USER_API_PVVIH"
# Résultat: doit montrer les routes avec "USER_API_PVVIH"

# 3. L'endpoint fonctionne
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123","nom":"Test","prenom":"User","nationalite":"Sénégal"}'
# Résultat: Code 200/201 avec token JWT
```

---

**IMPORTANT**: Le simple `docker-compose restart` ne suffit PAS car il ne recharge pas la configuration depuis GitHub. Il faut absolument faire `rm -f` puis `up -d` pour forcer le rechargement.
