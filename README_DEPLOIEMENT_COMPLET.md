# 🚀 Guide de Déploiement Complet - Projet PVVIH

## 📋 Table des Matières

- [Vue d'Ensemble](#vue-densemble)
- [Déploiement AWS EC2](#déploiement-aws-ec2)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Support](#support)

---

## 🎯 Vue d'Ensemble

Ce projet est une plateforme de gestion pour PVVIH (Personnes Vivant avec le VIH) composée de:
- **Microservices Backend** (Spring Boot)
- **Frontends** (React)
- **Bases de données** (MySQL, MongoDB)
- **Service Discovery** (Eureka)
- **API Gateway** (Spring Cloud Gateway)

---

## 🌐 Déploiement AWS EC2

### ⚡ Démarrage Rapide

Vous êtes sur AWS EC2? Commencez ici:

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO

# 2. Configurer l'environnement
cp .env.aws.example .env
nano .env  # Modifiez les mots de passe et JWT_SECRET

# 3. Déployer
chmod +x deploy-aws-simple.sh
bash deploy-aws-simple.sh
```

**⏱️ Temps: 10-20 minutes**

### 📚 Documentation AWS Complète

| Fichier | Description |
|---------|-------------|
| **[COMMENCEZ_ICI.md](COMMENCEZ_ICI.md)** | 👈 Point de départ |
| **[INDEX_DOCUMENTATION_AWS.md](INDEX_DOCUMENTATION_AWS.md)** | Index de toute la documentation |
| **[DEMARRAGE_RAPIDE_AWS.md](DEMARRAGE_RAPIDE_AWS.md)** | Déploiement en 5 commandes |
| **[DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md](DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md)** | Guide détaillé |
| **[README_AWS_DEPLOIEMENT.md](README_AWS_DEPLOIEMENT.md)** | Documentation complète |

### 🌐 URLs d'Accès (AWS)

Après déploiement sur AWS EC2 (IP: 56.228.35.80):

```
Gateway API:        http://56.228.35.80:8080
Eureka Dashboard:   http://56.228.35.80:8761
Frontend Forum:     http://56.228.35.80:3001
Frontend Reference: http://56.228.35.80:3002
Frontend User:      http://56.228.35.80:3003
```

---

## 💻 Déploiement Local

### Prérequis

- Docker Desktop installé
- Docker Compose installé
- 8 GB RAM minimum
- 20 GB espace disque

### Démarrage Rapide Local

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO

# 2. Configurer l'environnement
cp .env.example .env

# 3. Démarrer
docker-compose up -d

# 4. Vérifier
docker-compose ps
```

### URLs d'Accès (Local)

```
Gateway API:        http://localhost:8080
Eureka Dashboard:   http://localhost:8761
Frontend Forum:     http://localhost:3001
Frontend Reference: http://localhost:3002
Frontend User:      http://localhost:3003
```

---

## 🏗️ Architecture

### Services Backend

| Service | Port | Description |
|---------|------|-------------|
| **api-register** | 8761 | Service Discovery (Eureka) |
| **api-configuration** | 8888 | Configuration centralisée |
| **gateway-pvvih** | 8080 | API Gateway |
| **gestion-user** | 9089 | Gestion utilisateurs + Authentification |
| **gestion-reference** | 9090 | Gestion des références |
| **gestion-patient** | 9091 | Gestion des patients |
| **forum-pvvih** | 9092 | Forum de discussion |

### Services Frontend

| Service | Port | Description |
|---------|------|-------------|
| **gestion-forum-front** | 3001 | Interface du forum |
| **a-reference-front** | 3002 | Interface de référence |
| **a-user-front** | 3003 | Interface utilisateur |

### Bases de Données

| Base | Type | Description |
|------|------|-------------|
| **user_db** | MySQL | Données utilisateurs |
| **reference_db** | MySQL | Données de référence |
| **patient_db** | MySQL | Données patients |
| **forum_db** | MongoDB | Données du forum |

### Architecture d'Authentification

- **Service unique d'authentification:** `gestion-user`
- **Validation JWT:** Tous les autres services
- **JWT_SECRET:** Partagé entre tous les services

📖 Détails: [ARCHITECTURE_AUTHENTIFICATION.md](ARCHITECTURE_AUTHENTIFICATION.md)

---

## 📚 Documentation

### 🚀 Déploiement

| Document | Type | Description |
|----------|------|-------------|
| **COMMENCEZ_ICI.md** | Guide | Point de départ |
| **INDEX_DOCUMENTATION_AWS.md** | Index | Index complet |
| **DEMARRAGE_RAPIDE_AWS.md** | Guide | Déploiement rapide AWS |
| **DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md** | Guide | Guide détaillé AWS |
| **README_AWS_DEPLOIEMENT.md** | Doc | Documentation complète AWS |
| **DEPLOIEMENT_LOCAL_SIMPLE.md** | Guide | Déploiement local |
| **LISEZ_MOI_DEPLOIEMENT.md** | Doc | Documentation générale |

### 🛠️ Scripts

| Script | Description |
|--------|-------------|
| **deploy-aws-simple.sh** | Déploiement automatisé AWS |
| **COMMANDES_AWS_DEPLOIEMENT.sh** | Guide interactif AWS |
| **deploy-local.ps1** | Déploiement local Windows |

### ⚙️ Configuration

| Fichier | Description |
|---------|-------------|
| **.env.aws.example** | Template AWS |
| **.env.example** | Template général |
| **docker-compose.yml** | Configuration Docker principale |
| **docker-compose.prod.yml** | Configuration production |
| **docker-compose.local.yml** | Configuration locale |

### 📖 Documentation Technique

| Document | Description |
|----------|-------------|
| **ARCHITECTURE_AUTHENTIFICATION.md** | Architecture d'authentification |
| **GUIDE_TEST_API.md** | Guide de test des APIs |
| **CORRECTION_ARCHITECTURE_FINALE.md** | Corrections appliquées |
| **CONFIGURATION_FIXES_SUMMARY.md** | Résumé des corrections |

### 📤 Transfert et Outils

| Document | Description |
|----------|-------------|
| **TRANSFERT_FICHIERS_AWS.md** | Transfert de fichiers vers AWS |
| **RESUME_DEPLOIEMENT_AWS.txt** | Résumé visuel AWS |

---

## 🧪 Tests

### Test d'Authentification

```bash
# Créer un utilisateur
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

# Se connecter
curl -X POST http://localhost:8080/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@test.com",
    "password": "admin123"
  }'
```

📖 Plus de tests: [GUIDE_TEST_API.md](GUIDE_TEST_API.md)

---

## 📊 Commandes Utiles

### Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Voir l'état
docker-compose ps

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service
docker-compose logs -f SERVICE_NAME

# Redémarrer un service
docker-compose restart SERVICE_NAME

# Arrêter tous les services
docker-compose down

# Voir les ressources
docker stats
```

### AWS EC2

```bash
# Démarrer (production)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Voir l'état
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Arrêter
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

---

## 🔐 Sécurité

### Configuration des Mots de Passe

Dans le fichier `.env`, configurez des mots de passe sécurisés:

```bash
MONGO_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_ROOT_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_USER_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_REFERENCE_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_PATIENT_PASSWORD=VotreMotDePasseSecurise123!
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789ABCDEFGHIJKLMNOP
```

### Recommandations

- Utilisez des mots de passe différents pour chaque service
- Minimum 12 caractères (majuscules, minuscules, chiffres, symboles)
- JWT_SECRET doit être identique sur tous les services
- Ne partagez JAMAIS ces informations
- Utilisez `openssl rand -base64 32` pour générer des mots de passe

---

## 🐛 Dépannage

### Service ne démarre pas

```bash
# Voir les logs
docker-compose logs SERVICE_NAME

# Redémarrer
docker-compose restart SERVICE_NAME
```

### Erreur de connexion à la base de données

```bash
# Vérifier que les bases sont healthy
docker-compose ps

# Voir les logs de la base
docker-compose logs mysql-user
docker-compose logs mongodb
```

### Manque de mémoire

```bash
# Voir l'utilisation
docker stats

# Augmenter les ressources Docker Desktop (local)
# Augmenter la taille de l'instance EC2 (AWS)
```

### Port déjà utilisé

```bash
# Voir les ports utilisés
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Arrêter le processus
# Ou changer le port dans docker-compose.yml
```

---

## 🔄 Mise à Jour

### Mettre à jour le code

```bash
# Pull les dernières modifications
git pull

# Reconstruire et redémarrer
docker-compose up -d --build
```

### Mettre à jour un service spécifique

```bash
# Reconstruire
docker-compose build SERVICE_NAME

# Redémarrer
docker-compose up -d SERVICE_NAME
```

---

## 📈 Monitoring

### Health Checks

```bash
# Gateway
curl http://localhost:8080/actuator/health

# Gestion User
curl http://localhost:9089/actuator/health

# Gestion Reference
curl http://localhost:9090/actuator/health

# Gestion Patient
curl http://localhost:9091/actuator/health

# Forum
curl http://localhost:9092/actuator/health
```

### Eureka Dashboard

Accédez à http://localhost:8761 pour voir tous les services enregistrés.

---

## 🎯 Prochaines Étapes

1. **Déploiement:** Suivez le guide approprié (AWS ou Local)
2. **Tests:** Testez l'authentification et les APIs
3. **Personnalisation:** Adaptez la configuration à vos besoins
4. **Production:** Configurez HTTPS, monitoring, backups

---

## 📞 Support

### Documentation

- Consultez d'abord la documentation appropriée
- Vérifiez les logs des services
- Consultez la section Dépannage

### Fichiers de Log

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f SERVICE_NAME

# Dernières 100 lignes
docker-compose logs --tail=100
```

---

## ✅ Checklist de Déploiement

### Avant le déploiement
- [ ] Docker et Docker Compose installés
- [ ] Repository cloné
- [ ] Fichier `.env` créé et configuré
- [ ] Mots de passe sécurisés définis
- [ ] JWT_SECRET configuré

### Pendant le déploiement
- [ ] Images Docker construites
- [ ] Services démarrés
- [ ] Aucune erreur dans les logs

### Après le déploiement
- [ ] Tous les services sont "healthy"
- [ ] Test d'API réussi (register/login)
- [ ] Frontends accessibles depuis le navigateur
- [ ] Eureka Dashboard affiche tous les services

---

## 📝 Licence

[Votre licence ici]

---

## 👥 Contributeurs

[Vos contributeurs ici]

---

**Bon déploiement! 🚀**

Pour commencer:
- **AWS EC2:** Lisez [COMMENCEZ_ICI.md](COMMENCEZ_ICI.md)
- **Local:** Lisez [DEPLOIEMENT_LOCAL_SIMPLE.md](DEPLOIEMENT_LOCAL_SIMPLE.md)
