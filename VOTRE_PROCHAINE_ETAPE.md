# 🎯 Votre Prochaine Étape

## 📍 Où vous en êtes

Vous êtes connecté à votre instance AWS EC2:
- **IP Publique:** 16.171.1.67
- **Prérequis:** ✅ Installés (Docker, Docker Compose, Git)
- **Security Group:** ✅ Configuré

---

## 🚀 Ce que vous devez faire MAINTENANT

### Étape 1: Cloner votre projet (2 minutes)

```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO
```

**⚠️ IMPORTANT:** Remplacez `VOTRE_USERNAME/VOTRE_REPO` par votre vrai repository GitHub!

**Exemple:**
```bash
git clone https://github.com/babacar/pvvih-project.git
cd pvvih-project
```

---

### Étape 2: Configurer l'environnement (3 minutes)

```bash
# Copier le template
cp .env.aws.example .env

# Éditer le fichier
nano .env
```

**Dans nano, modifiez UNIQUEMENT ces lignes:**

```bash
# Ligne 7: Changez le mot de passe MongoDB
MONGO_PASSWORD=VotreMotDePasseMongo123!

# Ligne 11: Changez le mot de passe MySQL root
MYSQL_ROOT_PASSWORD=VotreMotDePasseRoot123!

# Ligne 15: Changez le mot de passe MySQL user
MYSQL_USER_PASSWORD=VotreMotDePasseUser123!

# Ligne 19: Changez le mot de passe MySQL reference
MYSQL_REFERENCE_PASSWORD=VotreMotDePasseReference123!

# Ligne 23: Changez le mot de passe MySQL patient
MYSQL_PATIENT_PASSWORD=VotreMotDePassePatient123!

# Ligne 29: Changez le JWT Secret (TRÈS IMPORTANT!)
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789ABCDEFGHIJKLMNOP
```

**Sauvegardez:**
1. Appuyez sur `Ctrl+X`
2. Tapez `Y`
3. Appuyez sur `Enter`

---

### Étape 3: Déployer (15-20 minutes)

```bash
# Rendre le script exécutable
chmod +x deploy-aws-simple.sh

# Lancer le déploiement
bash deploy-aws-simple.sh
```

**Le script va:**
- ✅ Construire toutes les images Docker
- ✅ Démarrer tous les services
- ✅ Vérifier les health checks
- ✅ Afficher les URLs d'accès

**Attendez que le script termine. Cela prend 15-20 minutes.**

---

## ✅ Comment savoir si ça a marché?

### 1. Vérifier l'état des services

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

**Tous les services doivent être "Up" et "healthy"**

### 2. Tester l'API

```bash
curl http://localhost:8080/actuator/health
```

**Doit retourner:** `{"status":"UP"}`

### 3. Ouvrir dans votre navigateur

Ouvrez ces URLs dans votre navigateur:

```
http://16.171.1.67:8080  (Gateway API)
http://16.171.1.67:8761  (Eureka Dashboard)
http://16.171.1.67:3001  (Frontend Forum)
http://16.171.1.67:3002  (Frontend Reference)
http://16.171.1.67:3003  (Frontend User)
```

**Si vous voyez les pages, c'est bon! ✅**

---

## 🧪 Test Final

Créez un utilisateur pour tester:

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

**Si vous recevez une réponse JSON avec les infos de l'utilisateur, c'est parfait! ✅**

---

## 🐛 Si quelque chose ne marche pas

### Voir les logs

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

**Appuyez sur `Ctrl+C` pour arrêter les logs**

### Redémarrer un service

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart SERVICE_NAME
```

**Remplacez `SERVICE_NAME` par le nom du service (ex: gateway-pvvih)**

### Tout redémarrer

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

---

## 📚 Besoin d'aide?

### Pour un guide détaillé
```bash
cat DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md
```

### Pour voir toutes les commandes
```bash
bash COMMANDES_AWS_DEPLOIEMENT.sh
```

### Pour un résumé visuel
```bash
cat RESUME_DEPLOIEMENT_AWS.txt
```

---

## 🎯 Récapitulatif

**3 commandes pour déployer:**

```bash
# 1. Cloner
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO

# 2. Configurer
cp .env.aws.example .env
nano .env  # Modifiez les mots de passe

# 3. Déployer
chmod +x deploy-aws-simple.sh
bash deploy-aws-simple.sh
```

**C'est tout! 🎉**

---

## 📞 Vous êtes bloqué?

1. **Vérifiez les logs:** `docker-compose logs -f`
2. **Vérifiez l'état:** `docker-compose ps`
3. **Lisez la doc:** `cat DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md`

---

**Allez-y, commencez maintenant! 🚀**

Première commande à exécuter:
```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
```

**N'oubliez pas de remplacer VOTRE_USERNAME et VOTRE_REPO!**
