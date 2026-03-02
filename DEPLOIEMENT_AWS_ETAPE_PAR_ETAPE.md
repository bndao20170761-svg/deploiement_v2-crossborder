# 🚀 Guide de Déploiement AWS EC2 - Étape par Étape

## Vous êtes ici: `ubuntu@ip-172-31-38-60:~$`

IP Publique: **16.171.1.67**

---

## ✅ Prérequis (Déjà fait)
- [x] Docker installé
- [x] Docker Compose installé
- [x] Security Group configuré (ports 8080, 3001, 3002, 3003, 8761 ouverts)

---

## 📦 ÉTAPE 1: Cloner le Projet

```bash
# Clonez votre repository GitHub
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Entrez dans le répertoire
cd VOTRE_REPO

# Vérifiez que tous les fichiers sont présents
ls -la
```

**Remplacez `VOTRE_USERNAME/VOTRE_REPO` par votre vrai repository GitHub.**

---

## 🔧 ÉTAPE 2: Configurer l'Environnement

### 2.1 Créer le fichier .env

```bash
# Copier l'exemple
cp .env.example .env

# Éditer le fichier
nano .env
```

### 2.2 Configuration du fichier .env

Copiez-collez cette configuration dans votre fichier `.env`:

```bash
# ==================== Environment Configuration ====================

# Spring Profile (IMPORTANT: prod pour production)
SPRING_PROFILES_ACTIVE=prod

# ==================== Database Configuration ====================

# MongoDB (Forum Service)
MONGO_PASSWORD=MongoSecure2024!

# MySQL Root Password (shared)
MYSQL_ROOT_PASSWORD=RootSecure2024!

# MySQL User Service
MYSQL_USER_PASSWORD=UserSecure2024!

# MySQL Reference Service
MYSQL_REFERENCE_PASSWORD=ReferenceSecure2024!

# MySQL Patient Service
MYSQL_PATIENT_PASSWORD=PatientSecure2024!

# ==================== Security Configuration ====================

# JWT Secret (TRÈS IMPORTANT - même clé pour tous les services)
# Générez une clé longue et sécurisée
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ

# ==================== Logging Configuration ====================

# Log Level (INFO pour production)
LOG_LEVEL=INFO
```

**Sauvegardez avec:**
- `Ctrl+X`
- Tapez `Y`
- Appuyez sur `Enter`

### 2.3 Vérifier la configuration

```bash
# Vérifier que le fichier .env existe
cat .env
```

---

## 🏗️ ÉTAPE 3: Construire et Déployer

### Option A: Construction locale (Recommandé pour premier déploiement)

```bash
# Construire toutes les images Docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Démarrer tous les services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option B: Si vous avez des images sur DockerHub

```bash
# Pull les images depuis DockerHub
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull

# Démarrer tous les services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📊 ÉTAPE 4: Surveiller le Déploiement

### 4.1 Voir l'état des services

```bash
# Voir tous les conteneurs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Voir les logs en temps réel
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

### 4.2 Attendre que tous les services soient "healthy"

Les services démarrent dans cet ordre:
1. **Bases de données** (30-60 secondes)
2. **api-register** (Eureka) (60 secondes)
3. **api-configuration** (60 secondes)
4. **gateway-pvvih** (60 secondes)
5. **Services backend** (90 secondes)
6. **Frontends** (10 secondes)

**Temps total estimé: 5-10 minutes**

### 4.3 Vérifier les health checks

```bash
# Vérifier le Gateway
curl http://localhost:8080/actuator/health

# Vérifier gestion-user
curl http://localhost:9089/actuator/health

# Vérifier gestion-reference
curl http://localhost:9090/actuator/health

# Vérifier gestion-patient
curl http://localhost:9091/actuator/health

# Vérifier forum
curl http://localhost:9092/actuator/health
```

**Tous doivent retourner: `{"status":"UP"}`**

---

## 🧪 ÉTAPE 5: Tester l'Application

### 5.1 Tester depuis l'instance EC2

```bash
# Test 1: Créer un utilisateur
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

# Test 2: Se connecter
curl -X POST http://localhost:8080/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@test.com",
    "password": "admin123"
  }'
```

### 5.2 Tester depuis votre machine locale

Ouvrez votre navigateur et accédez à:

```
Gateway API:        http://16.171.1.67:8080
Eureka Dashboard:   http://16.171.1.67:8761
Frontend Forum:     http://16.171.1.67:3001
Frontend Reference: http://16.171.1.67:3002
Frontend User:      http://16.171.1.67:3003
```

---

## 📈 ÉTAPE 6: Monitoring et Maintenance

### 6.1 Surveiller les ressources

```bash
# Voir l'utilisation CPU/Mémoire
docker stats

# Voir l'espace disque
df -h

# Voir la mémoire disponible
free -h
```

### 6.2 Voir les logs d'un service spécifique

```bash
# Logs du Gateway
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f gateway-pvvih

# Logs de gestion-user
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f gestion-user

# Logs de gestion-reference
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f gestion-reference
```

### 6.3 Redémarrer un service

```bash
# Redémarrer le Gateway
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart gateway-pvvih

# Redémarrer gestion-user
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart gestion-user
```

---

## 🛑 Commandes Utiles

### Arrêter tous les services

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### Redémarrer tous les services

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

### Voir les conteneurs en cours d'exécution

```bash
docker ps
```

### Nettoyer les images inutilisées

```bash
docker system prune -a
```

---

## 🐛 Dépannage

### Problème: Service ne démarre pas

```bash
# Voir les logs du service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs SERVICE_NAME

# Redémarrer le service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart SERVICE_NAME
```

### Problème: Erreur de connexion à la base de données

```bash
# Vérifier que les bases de données sont healthy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Vérifier les logs de la base de données
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs mysql-user
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs mongodb
```

### Problème: Manque de mémoire

```bash
# Voir l'utilisation
free -h
docker stats

# Si nécessaire, augmentez la taille de votre instance EC2
```

### Problème: Port déjà utilisé

```bash
# Voir les ports utilisés
sudo netstat -tulpn | grep LISTEN

# Arrêter le processus qui utilise le port
sudo kill -9 PID
```

---

## 📋 Checklist de Déploiement

- [ ] Repository cloné
- [ ] Fichier .env créé et configuré
- [ ] Mots de passe sécurisés définis
- [ ] JWT_SECRET configuré
- [ ] Images Docker construites
- [ ] Services démarrés
- [ ] Tous les services sont "healthy"
- [ ] Tests d'API réussis (register/login)
- [ ] Frontends accessibles depuis le navigateur
- [ ] Eureka Dashboard affiche tous les services

---

## 🎯 URLs d'Accès Final

Une fois le déploiement terminé:

| Service | URL |
|---------|-----|
| Gateway API | http://16.171.1.67:8080 |
| Eureka Dashboard | http://16.171.1.67:8761 |
| Frontend Forum | http://16.171.1.67:3001 |
| Frontend Reference | http://16.171.1.67:3002 |
| Frontend User | http://16.171.1.67:3003 |

---

## 📚 Documentation Complémentaire

- `ARCHITECTURE_AUTHENTIFICATION.md` - Architecture d'authentification
- `GUIDE_TEST_API.md` - Guide de test des APIs
- `CORRECTION_ARCHITECTURE_FINALE.md` - Corrections appliquées

---

## 🆘 Besoin d'Aide?

Si vous rencontrez des problèmes:

1. Vérifiez les logs: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f`
2. Vérifiez l'état: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps`
3. Vérifiez les ressources: `docker stats`
4. Consultez la documentation complète

---

**Bon déploiement! 🚀**
