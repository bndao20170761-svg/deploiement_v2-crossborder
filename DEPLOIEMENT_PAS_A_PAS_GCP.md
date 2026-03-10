# 🚀 Déploiement Pas à Pas sur GCP

## 📋 Ordre de Déploiement
1. **Frontends** (build et démarrage)
2. **Bases de données** (démarrage)
3. **Services Edge** (Eureka, Config Server, Gateway)
4. **Services Backend** (Forum, User, Reference, Patient)

---

## ⚙️ Prérequis

Assurez-vous d'être dans le répertoire du projet:
```bash
cd ~/deploiement_v2-crossborder
```

Vérifiez que le fichier `.env` existe:
```bash
cat .env | grep PUBLIC_IP
# Devrait afficher: PUBLIC_IP=34.133.155.230
```

---

## 📦 ÉTAPE 1: BUILD ET DÉMARRAGE DES FRONTENDS

### 1.1 Build du Frontend Forum (Port 3001)

```bash
echo "🔨 Build du Frontend Forum..."
docker-compose build gestion-forum-front
```

**Temps estimé:** 3-5 minutes

**Vérification:**
```bash
docker images | grep gestion-forum-front
```

### 1.2 Build du Frontend Reference (Port 3002)

```bash
echo "🔨 Build du Frontend Reference..."
docker-compose build a-reference-front
```

**Temps estimé:** 3-5 minutes

**Vérification:**
```bash
docker images | grep a-reference-front
```

### 1.3 Build du Frontend User (Port 3003)

```bash
echo "🔨 Build du Frontend User..."
docker-compose build a-user-front
```

**Temps estimé:** 3-5 minutes

**Vérification:**
```bash
docker images | grep a-user-front
```

### 1.4 Démarrage des Frontends

```bash
echo "🚀 Démarrage des frontends..."
docker-compose up -d gestion-forum-front a-reference-front a-user-front
```

**Vérification:**
```bash
docker-compose ps | grep front
```

Vous devriez voir:
```
gestion-forum-front   Up   0.0.0.0:3001->80/tcp
a-reference-front     Up   0.0.0.0:3002->80/tcp
a-user-front          Up   0.0.0.0:3003->80/tcp
```

**Test d'accès:**
```bash
# Test local
curl -I http://localhost:3001
curl -I http://localhost:3002
curl -I http://localhost:3003

# Test externe (depuis votre machine)
# Ouvrir dans le navigateur:
# http://34.133.155.230:3001
# http://34.133.155.230:3002
# http://34.133.155.230:3003
```

**Logs des frontends:**
```bash
docker-compose logs -f gestion-forum-front
# Ctrl+C pour quitter
```

---

## 🗄️ ÉTAPE 2: DÉMARRAGE DES BASES DE DONNÉES

### 2.1 Démarrage de MongoDB (Forum)

```bash
echo "🗄️ Démarrage de MongoDB..."
docker-compose up -d mongodb
```

**Attendre 30 secondes:**
```bash
sleep 30
```

**Vérification:**
```bash
docker-compose ps mongodb
docker-compose logs mongodb | tail -20
```

Vous devriez voir: `Waiting for connections`

**Test de connexion:**
```bash
docker exec -it mongodb mongosh --eval "db.adminCommand('ping')"
```

### 2.2 Démarrage de MySQL User (Port 3307)

```bash
echo "🗄️ Démarrage de MySQL User..."
docker-compose up -d mysql-user
```

**Attendre 30 secondes:**
```bash
sleep 30
```

**Vérification:**
```bash
docker-compose ps mysql-user
docker-compose logs mysql-user | tail -20
```

Vous devriez voir: `ready for connections`

**Test de connexion:**
```bash
docker exec -it mysql-user mysqladmin ping -h localhost
```

### 2.3 Démarrage de MySQL Reference (Port 3308)

```bash
echo "🗄️ Démarrage de MySQL Reference..."
docker-compose up -d mysql-reference
```

**Attendre 30 secondes:**
```bash
sleep 30
```

**Vérification:**
```bash
docker-compose ps mysql-reference
docker-compose logs mysql-reference | tail -20
```

### 2.4 Démarrage de MySQL Patient (Port 3309)

```bash
echo "🗄️ Démarrage de MySQL Patient..."
docker-compose up -d mysql-patient
```

**Attendre 30 secondes:**
```bash
sleep 30
```

**Vérification:**
```bash
docker-compose ps mysql-patient
docker-compose logs mysql-patient | tail -20
```

### 2.5 Vérification Globale des Bases de Données

```bash
echo "📊 État des bases de données:"
docker-compose ps | grep -E "mongodb|mysql"
```

Toutes doivent être "Up" et "healthy".

---

## 🌐 ÉTAPE 3: BUILD ET DÉMARRAGE DES SERVICES EDGE

### 3.1 Build et Démarrage d'Eureka (Service Registry - Port 8761)

```bash
echo "🔨 Build d'Eureka..."
docker-compose build api-register

echo "🚀 Démarrage d'Eureka..."
docker-compose up -d api-register
```

**Attendre 60 secondes:**
```bash
sleep 60
```

**Vérification:**
```bash
docker-compose ps api-register
docker-compose logs api-register | tail -30
```

**Test d'accès:**
```bash
curl -I http://localhost:8761
# Ou ouvrir dans le navigateur: http://34.133.155.230:8761
```

### 3.2 Build et Démarrage du Config Server (Port 8888)

```bash
echo "🔨 Build du Config Server..."
docker-compose build api-configuration

echo "🚀 Démarrage du Config Server..."
docker-compose up -d api-configuration
```

**Attendre 60 secondes:**
```bash
sleep 60
```

**Vérification:**
```bash
docker-compose ps api-configuration
docker-compose logs api-configuration | tail -30
```

**Test d'accès:**
```bash
curl http://localhost:8888/actuator/health
```

### 3.3 Build et Démarrage du Gateway (Port 8080)

```bash
echo "🔨 Build du Gateway..."
docker-compose build gateway-pvvih

echo "🚀 Démarrage du Gateway..."
docker-compose up -d gateway-pvvih
```

**Attendre 60 secondes:**
```bash
sleep 60
```

**Vérification:**
```bash
docker-compose ps gateway-pvvih
docker-compose logs gateway-pvvih | tail -30
```

**Test d'accès:**
```bash
curl http://localhost:8080/actuator/health
# Devrait retourner: {"status":"UP"}
```

### 3.4 Vérification Globale des Services Edge

```bash
echo "📊 État des services edge:"
docker-compose ps | grep -E "api-register|api-configuration|gateway"
```

Tous doivent être "Up" et "healthy".

---

## 🔧 ÉTAPE 4: BUILD ET DÉMARRAGE DES SERVICES BACKEND

### 4.1 Build et Démarrage du Service Forum (Port 9092)

```bash
echo "🔨 Build du Service Forum..."
docker-compose build forum-pvvih

echo "🚀 Démarrage du Service Forum..."
docker-compose up -d forum-pvvih
```

**Attendre 90 secondes:**
```bash
sleep 90
```

**Vérification:**
```bash
docker-compose ps forum-pvvih
docker-compose logs forum-pvvih | tail -30
```

**Test d'accès:**
```bash
curl http://localhost:9092/actuator/health
```

### 4.2 Build et Démarrage du Service User (Port 9089)

```bash
echo "🔨 Build du Service User..."
docker-compose build gestion-user

echo "🚀 Démarrage du Service User..."
docker-compose up -d gestion-user
```

**Attendre 90 secondes:**
```bash
sleep 90
```

**Vérification:**
```bash
docker-compose ps gestion-user
docker-compose logs gestion-user | tail -30
```

**Test d'accès:**
```bash
curl http://localhost:9089/actuator/health
```

### 4.3 Build et Démarrage du Service Reference (Port 9090)

```bash
echo "🔨 Build du Service Reference..."
docker-compose build gestion-reference

echo "🚀 Démarrage du Service Reference..."
docker-compose up -d gestion-reference
```

**Attendre 90 secondes:**
```bash
sleep 90
```

**Vérification:**
```bash
docker-compose ps gestion-reference
docker-compose logs gestion-reference | tail -30
```

**Test d'accès:**
```bash
curl http://localhost:9090/actuator/health
```

### 4.4 Build et Démarrage du Service Patient (Port 9091)

```bash
echo "🔨 Build du Service Patient..."
docker-compose build gestion-patient

echo "🚀 Démarrage du Service Patient..."
docker-compose up -d gestion-patient
```

**Attendre 90 secondes:**
```bash
sleep 90
```

**Vérification:**
```bash
docker-compose ps gestion-patient
docker-compose logs gestion-patient | tail -30
```

**Test d'accès:**
```bash
curl http://localhost:9091/actuator/health
```

### 4.5 Vérification Globale des Services Backend

```bash
echo "📊 État des services backend:"
docker-compose ps | grep -E "forum|gestion"
```

Tous doivent être "Up" et "healthy".

---

## ✅ ÉTAPE 5: VÉRIFICATION FINALE

### 5.1 État Global de Tous les Services

```bash
echo "📊 État global de tous les services:"
docker-compose ps
```

### 5.2 Vérification Eureka Dashboard

Ouvrez dans votre navigateur:
```
http://34.133.155.230:8761
```

Vous devriez voir tous les services enregistrés:
- FORUM_API_PVVIH
- USER_API_PVVIH
- REFERENCE_API_PVVIH
- PATIENT_API_PVVIH
- GETWAY_PVVIH

### 5.3 Test de l'API via Gateway

```bash
# Test de création d'utilisateur
curl -X POST http://localhost:8080/api/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@test.com",
    "password": "admin123",
    "nom": "Admin",
    "prenom": "Test",
    "profil": "ADMIN",
    "nationalite": "Sénégalaise",
    "actif": true
  }'

# Test de connexion
curl -X POST http://localhost:8080/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@test.com",
    "password": "admin123"
  }'
```

### 5.4 Test des Frontends

Ouvrez dans votre navigateur:
```
http://34.133.155.230:3001  (Forum)
http://34.133.155.230:3002  (Reference)
http://34.133.155.230:3003  (User)
```

### 5.5 Vérification des Logs

```bash
# Voir tous les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f gateway-pvvih
docker-compose logs -f gestion-user
```

---

## 📊 RÉSUMÉ DES TEMPS

| Étape | Composant | Build | Démarrage | Total |
|-------|-----------|-------|-----------|-------|
| 1 | Frontends (3) | 9-15 min | 10 sec | ~15 min |
| 2 | Bases de données (4) | - | 2 min | ~2 min |
| 3 | Services Edge (3) | 5-10 min | 3 min | ~13 min |
| 4 | Services Backend (4) | 10-20 min | 6 min | ~26 min |

**Temps total estimé:** 50-60 minutes

---

## 🛑 COMMANDES UTILES

### Arrêter un service spécifique
```bash
docker-compose stop SERVICE_NAME
```

### Redémarrer un service
```bash
docker-compose restart SERVICE_NAME
```

### Voir les logs d'un service
```bash
docker-compose logs -f SERVICE_NAME
```

### Reconstruire un service
```bash
docker-compose build --no-cache SERVICE_NAME
docker-compose up -d SERVICE_NAME
```

### Arrêter tous les services
```bash
docker-compose down
```

### Nettoyer les images
```bash
docker system prune -a
```

---

## 🐛 DÉPANNAGE

### Si un frontend ne démarre pas:
```bash
docker-compose logs gestion-forum-front
docker-compose restart gestion-forum-front
```

### Si une base de données ne démarre pas:
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

### Si un service backend ne démarre pas:
```bash
# Vérifier que les dépendances sont démarrées
docker-compose ps | grep -E "mongodb|mysql|api-register|api-configuration"

# Voir les logs
docker-compose logs gestion-user

# Redémarrer
docker-compose restart gestion-user
```

### Si le Gateway ne fonctionne pas:
```bash
# Vérifier Eureka et Config Server
docker-compose ps api-register api-configuration

# Redémarrer le Gateway
docker-compose restart gateway-pvvih
```

---

## 📋 CHECKLIST DE DÉPLOIEMENT

- [ ] Frontends buildés et démarrés (3001, 3002, 3003)
- [ ] MongoDB démarré et healthy
- [ ] MySQL User démarré et healthy
- [ ] MySQL Reference démarré et healthy
- [ ] MySQL Patient démarré et healthy
- [ ] Eureka démarré et accessible (8761)
- [ ] Config Server démarré et healthy (8888)
- [ ] Gateway démarré et healthy (8080)
- [ ] Service Forum démarré et enregistré
- [ ] Service User démarré et enregistré
- [ ] Service Reference démarré et enregistré
- [ ] Service Patient démarré et enregistré
- [ ] Tous les services visibles dans Eureka
- [ ] Test API réussi (register/login)
- [ ] Frontends accessibles depuis le navigateur

---

**Bon déploiement! 🚀**
