# 🚀 Déploiement AWS EC2 - Guide Complet

## 📍 Informations de votre Instance

- **Utilisateur:** `ubuntu@ip-172-31-38-60`
- **IP Publique:** `16.171.1.67`
- **Région:** `eu-north-1` (Stockholm)
- **OS:** Ubuntu 24.04.3 LTS

---

## ⚡ Déploiement Rapide (5 minutes)

### Étape 1: Cloner le projet

```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO
```

### Étape 2: Configurer l'environnement

```bash
cp .env.aws.example .env
nano .env
```

Modifiez les mots de passe et le JWT_SECRET, puis sauvegardez (`Ctrl+X` → `Y` → `Enter`).

### Étape 3: Déployer

```bash
chmod +x deploy-aws-simple.sh
bash deploy-aws-simple.sh
```

**C'est tout!** Le script fait tout automatiquement. ⏱️ Temps: 10-20 minutes

---

## 🌐 URLs d'Accès

Une fois déployé, accédez à:

| Service | URL | Description |
|---------|-----|-------------|
| **Gateway API** | http://16.171.1.67:8080 | Point d'entrée principal |
| **Eureka** | http://16.171.1.67:8761 | Service Discovery |
| **Forum** | http://16.171.1.67:3001 | Interface Forum |
| **Reference** | http://16.171.1.67:3002 | Interface Référence |
| **User** | http://16.171.1.67:3003 | Interface Utilisateur |

---

## 🧪 Test Rapide

### Créer un utilisateur

```bash
curl -X POST http://16.171.1.67:8080/api/user-auth/register \
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
```

### Se connecter

```bash
curl -X POST http://16.171.1.67:8080/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@test.com",
    "password": "admin123"
  }'
```

---

## 📊 Commandes Utiles

```bash
# Voir l'état des services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Voir les ressources
docker stats

# Redémarrer un service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart SERVICE_NAME

# Arrêter tous les services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

---

## 📚 Documentation Détaillée

| Fichier | Description |
|---------|-------------|
| **DEMARRAGE_RAPIDE_AWS.md** | Guide de démarrage rapide (5 commandes) |
| **DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md** | Guide détaillé avec explications |
| **COMMANDES_AWS_DEPLOIEMENT.sh** | Script interactif avec toutes les commandes |
| **.env.aws.example** | Template de configuration AWS |
| **deploy-aws-simple.sh** | Script de déploiement automatisé |

---

## 🔧 Configuration Requise

### ✅ Déjà fait (Prérequis installés)

- [x] Docker installé
- [x] Docker Compose installé
- [x] Git installé
- [x] Security Group configuré (ports 8080, 3001-3003, 8761 ouverts)

### 📝 À faire

- [ ] Cloner le repository
- [ ] Configurer le fichier `.env`
- [ ] Lancer le déploiement
- [ ] Tester l'application

---

## 🏗️ Architecture

### Services Backend

- **api-register** (Eureka) - Service Discovery
- **api-configuration** - Configuration centralisée
- **gateway-pvvih** - API Gateway
- **gestion-user** - Gestion des utilisateurs (authentification)
- **gestion-reference** - Gestion des références
- **gestion-patient** - Gestion des patients
- **forum-pvvih** - Forum de discussion

### Services Frontend

- **gestion-forum-front** - Interface du forum
- **a-reference-front** - Interface de référence
- **a-user-front** - Interface utilisateur

### Bases de Données

- **MySQL** (3 instances) - user_db, reference_db, patient_db
- **MongoDB** - forum_db

---

## 🔐 Sécurité

### Mots de passe à configurer dans `.env`

```bash
MONGO_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_ROOT_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_USER_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_REFERENCE_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_PATIENT_PASSWORD=VotreMotDePasseSecurise123!
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789ABCDEFGHIJKLMNOP
```

**⚠️ IMPORTANT:**
- Utilisez des mots de passe différents pour chaque service
- Minimum 12 caractères avec majuscules, minuscules, chiffres et symboles
- Le JWT_SECRET doit être identique sur tous les services
- Ne partagez JAMAIS ces informations

---

## 🐛 Dépannage

### Service ne démarre pas

```bash
# Voir les logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs SERVICE_NAME

# Redémarrer
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart SERVICE_NAME
```

### Erreur de connexion

1. Vérifiez le Security Group AWS (ports ouverts)
2. Vérifiez que les services sont "healthy"
3. Vérifiez les logs

### Manque de mémoire

```bash
# Voir l'utilisation
free -h
docker stats

# Si nécessaire, augmentez la taille de l'instance EC2
```

---

## 📈 Monitoring

### Vérifier la santé des services

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

Accédez à http://16.171.1.67:8761 pour voir tous les services enregistrés.

---

## 🔄 Mise à Jour

### Mettre à jour le code

```bash
# Pull les dernières modifications
git pull

# Reconstruire et redémarrer
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Mettre à jour un service spécifique

```bash
# Reconstruire le service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build SERVICE_NAME

# Redémarrer le service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d SERVICE_NAME
```

---

## 📞 Support

### Fichiers de log

```bash
# Tous les services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Service spécifique
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f SERVICE_NAME

# Dernières 100 lignes
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100
```

### Informations système

```bash
# Version Docker
docker --version

# Version Docker Compose
docker-compose --version

# Espace disque
df -h

# Mémoire
free -h

# Processus
top
```

---

## ✅ Checklist de Déploiement

- [ ] Repository cloné
- [ ] Fichier `.env` créé et configuré
- [ ] Mots de passe sécurisés définis
- [ ] JWT_SECRET configuré (même clé partout)
- [ ] Script de déploiement exécuté
- [ ] Tous les services sont "healthy"
- [ ] Test d'API réussi (register/login)
- [ ] Frontends accessibles depuis le navigateur
- [ ] Eureka Dashboard affiche tous les services

---

## 🎯 Prochaines Étapes

1. **Nom de domaine** - Configurez un nom de domaine pour votre application
2. **HTTPS** - Installez un certificat SSL avec Let's Encrypt
3. **Monitoring** - Configurez des outils de monitoring (Prometheus, Grafana)
4. **Backup** - Mettez en place des sauvegardes automatiques des bases de données
5. **CI/CD** - Configurez un pipeline de déploiement automatique

---

**Bon déploiement! 🚀**

Pour toute question, consultez la documentation détaillée ou les logs des services.
