# ⚡ Démarrage Rapide AWS EC2

## Vous êtes connecté à: `ubuntu@ip-172-31-38-60:~$`
## IP Publique: `16.171.1.67`

---

## 🚀 Déploiement en 5 Commandes

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO
```

**⚠️ Remplacez `VOTRE_USERNAME/VOTRE_REPO` par votre vrai repository!**

---

### 2️⃣ Configurer l'environnement

```bash
# Copier le fichier d'exemple AWS
cp .env.aws.example .env

# Éditer le fichier
nano .env
```

**Configuration minimale à modifier dans `.env`:**

```bash
# Changez ces mots de passe!
MONGO_PASSWORD=VotreMotDePasseMongo123!
MYSQL_ROOT_PASSWORD=VotreMotDePasseRoot123!
MYSQL_USER_PASSWORD=VotreMotDePasseUser123!
MYSQL_REFERENCE_PASSWORD=VotreMotDePasseReference123!
MYSQL_PATIENT_PASSWORD=VotreMotDePassePatient123!

# JWT Secret (TRÈS IMPORTANT - même clé partout)
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789ABCDEFGHIJKLMNOP
```

**Sauvegardez:** `Ctrl+X` → `Y` → `Enter`

---

### 3️⃣ Rendre le script exécutable

```bash
chmod +x deploy-aws-simple.sh
```

---

### 4️⃣ Lancer le déploiement

```bash
bash deploy-aws-simple.sh
```

**⏱️ Temps estimé: 10-20 minutes**

---

### 5️⃣ Vérifier le déploiement

```bash
# Voir l'état des services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Tester l'API
curl http://localhost:8080/actuator/health
```

---

## 🌐 Accéder à votre application

Une fois le déploiement terminé, ouvrez votre navigateur:

| Service | URL |
|---------|-----|
| **Gateway API** | http://16.171.1.67:8080 |
| **Eureka Dashboard** | http://16.171.1.67:8761 |
| **Frontend Forum** | http://16.171.1.67:3001 |
| **Frontend Reference** | http://16.171.1.67:3002 |
| **Frontend User** | http://16.171.1.67:3003 |

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
# Voir les logs en temps réel
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Voir l'état des services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Voir l'utilisation des ressources
docker stats

# Redémarrer un service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart gateway-pvvih

# Arrêter tous les services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

---

## 🐛 Problèmes Courants

### Service ne démarre pas

```bash
# Voir les logs du service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs SERVICE_NAME

# Redémarrer le service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart SERVICE_NAME
```

### Erreur de connexion

Vérifiez que le Security Group AWS a bien les ports ouverts:
- 8080 (Gateway)
- 3001, 3002, 3003 (Frontends)
- 8761 (Eureka)

### Manque de mémoire

```bash
# Voir l'utilisation
free -h
docker stats

# Si nécessaire, augmentez la taille de votre instance EC2
```

---

## 📚 Documentation Complète

- **Guide détaillé:** `DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md`
- **Architecture:** `ARCHITECTURE_AUTHENTIFICATION.md`
- **Tests API:** `GUIDE_TEST_API.md`

---

## ✅ Checklist

- [ ] Repository cloné
- [ ] Fichier .env configuré avec des mots de passe sécurisés
- [ ] JWT_SECRET configuré (même clé partout)
- [ ] Script de déploiement exécuté
- [ ] Tous les services sont "healthy"
- [ ] Test d'API réussi (register/login)
- [ ] Frontends accessibles depuis le navigateur

---

**Bon déploiement! 🎉**
