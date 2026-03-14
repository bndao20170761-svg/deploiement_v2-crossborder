# PROBLÈME ET SOLUTION - GATEWAY 404 SUR /api/auth/register

## LE PROBLÈME

Vous obtenez une erreur 404 quand vous essayez d'accéder à:
```
POST http://34.32.116.206:8080/api/auth/register
```

Erreur retournée:
```json
{
  "timestamp": "2026-03-11T01:39:42.009+00:00",
  "path": "/api/auth/register",
  "status": 404,
  "error": "Not Found",
  "requestId": "beb4e992-376"
}
```

## LA CAUSE RACINE

D'après vos logs Eureka, les services sont enregistrés avec des **UNDERSCORES**:
```xml
<application><name>USER_API_PVVIH</name></application>
<application><name>PATIENT_API_PVVIH</name></application>
<application><name>REFERENCE_API_PVVIH</name></application>
<application><name>FORUM_API_PVVIH</name></application>
<application><name>GETWAY_PVVIH</name></application>
```

Mais la configuration du Gateway sur GitHub utilise des **HYPHENS**:
```yaml
# ❌ INCORRECT (sur GitHub actuellement)
- id: user-api-auth
  uri: lb://USER-API-PVVIH  # Avec hyphens
```

Résultat:
1. Le Gateway cherche le service `USER-API-PVVIH` dans Eureka
2. Eureka n'a que `USER_API_PVVIH` (avec underscores)
3. Le Gateway ne trouve pas le service
4. Il retourne 404 Not Found

## LA SOLUTION

### Étape 1: Corriger la configuration sur GitHub

Le fichier `GETWAY_PVVIH-prod-CORRIGE.yml` dans votre projet local contient déjà la configuration correcte avec underscores:

```yaml
# ✅ CORRECT
- id: user-api-auth
  uri: lb://USER_API_PVVIH  # Avec underscores
```

**Actions à faire:**
1. Aller sur: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
2. Ouvrir le fichier: `GETWAY_PVVIH-prod.yml`
3. Cliquer sur "Edit"
4. Supprimer tout le contenu
5. Copier-coller le contenu complet de `GETWAY_PVVIH-prod-CORRIGE.yml`
6. Commit avec message: "Fix: Correction noms services Eureka avec underscores"

### Étape 2: Forcer le rechargement sur la VM

**IMPORTANT**: Un simple `docker-compose restart` ne suffit PAS car il ne recharge pas la configuration depuis GitHub.

Il faut **supprimer** les conteneurs puis les **recréer**:

```bash
# Se connecter à la VM
gcloud compute ssh babacarndao615@instance-20260310-134136
cd ~/deploiement_v2-crossborder

# Arrêter et supprimer les conteneurs
docker-compose stop gateway-pvvih api-configuration
docker-compose rm -f gateway-pvvih api-configuration

# Redémarrer Config Server
docker-compose up -d api-configuration
sleep 20

# Vérifier que la config est correcte
curl http://localhost:8888/GETWAY_PVVIH/prod | grep "USER_API_PVVIH"
# Vous DEVEZ voir "USER_API_PVVIH" (underscores), pas "USER-API-PVVIH" (hyphens)

# Redémarrer Gateway
docker-compose up -d gateway-pvvih
sleep 30

# Vérifier les routes
curl http://localhost:8080/actuator/gateway/routes | jq '.'
```

### Étape 3: Tester

```bash
# Test depuis la VM
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123","nom":"Test","prenom":"User","nationalite":"Sénégal"}'
```

Depuis Postman:
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

## TOUS LES SERVICES CONCERNÉS

Tous ces services doivent utiliser des underscores dans la configuration du Gateway:

| Service dans Eureka | URI dans Gateway Config |
|---------------------|-------------------------|
| `USER_API_PVVIH` | `lb://USER_API_PVVIH` |
| `PATIENT_API_PVVIH` | `lb://PATIENT_API_PVVIH` |
| `REFERENCE_API_PVVIH` | `lb://REFERENCE_API_PVVIH` |
| `FORUM_API_PVVIH` | `lb://FORUM_API_PVVIH` |

Le fichier `GETWAY_PVVIH-prod-CORRIGE.yml` contient déjà toutes ces corrections.

## VÉRIFICATIONS APRÈS CORRECTION

### 1. Config Server a la bonne config
```bash
curl http://localhost:8888/GETWAY_PVVIH/prod | grep "USER_API_PVVIH"
```
✅ Doit contenir "USER_API_PVVIH" (underscores)
❌ Ne doit PAS contenir "USER-API-PVVIH" (hyphens)

### 2. Gateway a chargé les routes
```bash
curl http://localhost:8080/actuator/gateway/routes | jq '.[] | select(.route_id=="user-api-auth")'
```
✅ Doit montrer `"uri": "lb://USER_API_PVVIH"`

### 3. Service est dans Eureka
```bash
curl http://localhost:8761/eureka/apps/USER_API_PVVIH
```
✅ Doit retourner du XML avec les infos du service
❌ Ne doit PAS retourner 404

### 4. L'endpoint fonctionne
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123","nom":"Test","prenom":"User","nationalite":"Sénégal"}'
```
✅ Doit retourner 200/201 avec un token JWT
❌ Ne doit PAS retourner 404

## FICHIERS À UTILISER

1. **GETWAY_PVVIH-prod-CORRIGE.yml** - Configuration correcte à copier sur GitHub
2. **COMMANDES_CORRECTION_GATEWAY.txt** - Toutes les commandes à exécuter
3. **reload-gateway-config.sh** - Script automatique pour recharger la config
4. **INSTRUCTIONS_CORRECTION_COMPLETE.md** - Instructions détaillées étape par étape

## POURQUOI LE SIMPLE RESTART NE MARCHE PAS

```bash
# ❌ NE MARCHE PAS
docker-compose restart gateway-pvvih
# Raison: Le conteneur garde sa config en mémoire, ne recharge pas depuis GitHub

# ✅ MARCHE
docker-compose rm -f gateway-pvvih
docker-compose up -d gateway-pvvih
# Raison: Nouveau conteneur = rechargement complet de la config depuis GitHub
```

## ORDRE DE DÉMARRAGE IMPORTANT

```
1. api-configuration (Config Server)
   ↓ attendre 20 secondes
2. gateway-pvvih (Gateway)
   ↓ attendre 30 secondes
3. Tests
```

Si vous démarrez le Gateway avant que Config Server soit prêt, il ne chargera pas la bonne configuration.

## EN CAS DE PROBLÈME PERSISTANT

Si après avoir suivi toutes les étapes, ça ne marche toujours pas:

1. Vérifier que gestion-user est bien démarré:
   ```bash
   docker-compose ps gestion-user
   docker-compose logs --tail=30 gestion-user
   ```

2. Tester directement gestion-user (bypass Gateway):
   ```bash
   docker inspect gestion-user | grep IPAddress
   curl -X POST http://172.18.0.X:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test@test.com","password":"test123","nom":"Test","prenom":"User","nationalite":"Sénégal"}'
   ```

3. Vérifier les logs du Gateway:
   ```bash
   docker-compose logs gateway-pvvih | grep -i "error\|route\|USER_API"
   ```

4. Redémarrer tous les services backend:
   ```bash
   docker-compose restart gestion-user gestion-patient gestion-reference forum-pvvih
   sleep 30
   docker-compose restart gateway-pvvih
   ```
