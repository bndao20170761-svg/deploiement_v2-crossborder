# 🚀 PROCHAINES ÉTAPES - DÉPLOIEMENT COMPLET

## ✅ CE QUI EST FAIT

Toutes les configurations sont prêtes:
- ✅ URLs dynamiques dans les frontends (Dockerfiles avec ARG/ENV)
- ✅ CORS configuré dans tous les microservices (variable d'environnement)
- ✅ Configuration Gateway YAML complète avec CORS
- ✅ Navigation entre frontends avec variables d'environnement
- ✅ docker-compose.yml avec toutes les variables
- ✅ .env.example (localhost) et .env.aws.example (AWS)
- ✅ Scripts de déploiement prêts

---

## 📋 ÉTAPES À SUIVRE

### 🎯 ÉTAPE 1: COPIER LA CONFIGURATION GATEWAY DANS GITHUB

**Durée estimée:** 5 minutes

1. Ouvrir le fichier `GETWAY_PVVIH-prod.yml` dans votre projet
2. Copier TOUT le contenu
3. Aller sur: https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
4. Créer ou modifier le fichier: `GETWAY_PVVIH-prod.yml`
5. Coller le contenu
6. Commit avec le message: "Configuration Gateway complète avec CORS"

**Pourquoi c'est important:**
Le Gateway charge sa configuration depuis ce repository GitHub. Sans cette étape, le CORS ne fonctionnera pas.

---

### 🎯 ÉTAPE 2: POUSSER VOTRE CODE SUR GITHUB

**Durée estimée:** 10 minutes

```bash
# 1. Vérifier les fichiers modifiés
git status

# 2. Ajouter tous les fichiers
git add .

# 3. Commit avec un message descriptif
git commit -m "Configuration complète pour déploiement AWS - URLs dynamiques et CORS"

# 4. Pousser sur GitHub
git push origin main
```

**Fichiers importants qui seront poussés:**
- Dockerfiles des frontends (avec ARG/ENV)
- SecurityConfig.java de tous les microservices (avec CORS_ALLOWED_ORIGINS)
- docker-compose.yml (avec variables d'environnement)
- .env.example et .env.aws.example
- Scripts de déploiement (deploy-aws-simple.sh)

---

### 🎯 ÉTAPE 3: SE CONNECTER À VOTRE INSTANCE AWS EC2

**Durée estimée:** 5 minutes

```bash
# Depuis votre machine locale
ssh -i "votre-cle.pem" ubuntu@16.171.1.67

# Ou si vous utilisez un autre utilisateur
ssh -i "votre-cle.pem" ec2-user@16.171.1.67
```

**Si vous n'avez pas encore d'instance EC2:**
1. Créer une instance EC2 sur AWS
2. Type: t2.medium ou t2.large (minimum)
3. Système: Ubuntu 22.04 LTS
4. Ouvrir les ports: 22, 80, 8080, 3001, 3002, 3003, 8761, 8888
5. Télécharger la clé SSH (.pem)

---

### 🎯 ÉTAPE 4: INSTALLER DOCKER SUR AWS EC2

**Durée estimée:** 10 minutes

```bash
# Sur l'instance EC2

# 1. Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# 2. Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# 4. Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Vérifier l'installation
docker --version
docker-compose --version

# 6. Redémarrer la session (ou se reconnecter)
exit
# Puis se reconnecter
ssh -i "votre-cle.pem" ubuntu@16.171.1.67
```

---

### 🎯 ÉTAPE 5: CLONER VOTRE PROJET SUR AWS

**Durée estimée:** 5 minutes

```bash
# Sur l'instance EC2

# 1. Cloner votre repository
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# 2. Aller dans le dossier
cd VOTRE_REPO

# 3. Vérifier que tous les fichiers sont là
ls -la
```

---

### 🎯 ÉTAPE 6: CONFIGURER L'ENVIRONNEMENT AWS

**Durée estimée:** 10 minutes

```bash
# Sur l'instance EC2, dans le dossier du projet

# 1. Copier le template AWS
cp .env.aws.example .env

# 2. Éditer le fichier .env
nano .env

# 3. Modifier les valeurs suivantes:
```

**Contenu du fichier .env à modifier:**
```bash
# ==================== Spring Profile ====================
SPRING_PROFILES_ACTIVE=prod

# ==================== AWS Public URLs ====================
PUBLIC_IP=16.171.1.67  # ← Votre IP publique AWS

PUBLIC_URL=http://16.171.1.67:8080
FORUM_URL=http://16.171.1.67:3001
FRONTEND1_URL=http://16.171.1.67:3002
FRONTEND2_URL=http://16.171.1.67:3003

# ==================== CORS Configuration ====================
CORS_ALLOWED_ORIGINS=http://16.171.1.67:3000,http://16.171.1.67:3001,http://16.171.1.67:3002,http://16.171.1.67:3003,http://16.171.1.67:8080

# ==================== Database Passwords ====================
# ⚠️ CHANGEZ CES MOTS DE PASSE PAR DES VALEURS SÉCURISÉES!
MONGO_PASSWORD=VotreMotDePasseMongoSecurise123!
MYSQL_ROOT_PASSWORD=VotreMotDePasseRootSecurise123!
MYSQL_USER_PASSWORD=VotreMotDePasseUserSecurise123!
MYSQL_REFERENCE_PASSWORD=VotreMotDePasseReferenceSecurise123!
MYSQL_PATIENT_PASSWORD=VotreMotDePassePatientSecurise123!

# ==================== JWT Secret ====================
# ⚠️ TRÈS IMPORTANT - Générez une clé longue et sécurisée!
# Commande pour générer: openssl rand -base64 64
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ

# ==================== Logging ====================
LOG_LEVEL=INFO
```

**Pour sauvegarder dans nano:**
- Appuyez sur `Ctrl + X`
- Appuyez sur `Y` (Yes)
- Appuyez sur `Enter`

---

### 🎯 ÉTAPE 7: LANCER LE DÉPLOIEMENT

**Durée estimée:** 20-30 minutes (premier build)

```bash
# Sur l'instance EC2, dans le dossier du projet

# Option 1: Utiliser le script automatique (RECOMMANDÉ)
chmod +x deploy-aws-simple.sh
./deploy-aws-simple.sh

# Option 2: Lancer manuellement
docker-compose up -d --build
```

**Le script va:**
1. Détecter automatiquement l'IP publique
2. Configurer toutes les variables d'environnement
3. Builder toutes les images Docker
4. Lancer tous les services
5. Afficher les logs en temps réel

**Temps de build estimé:**
- Première fois: 20-30 minutes
- Builds suivants: 5-10 minutes (cache Docker)

---

### 🎯 ÉTAPE 8: VÉRIFIER LE DÉPLOIEMENT

**Durée estimée:** 10 minutes

```bash
# Sur l'instance EC2

# 1. Vérifier que tous les conteneurs sont lancés
docker-compose ps

# 2. Vérifier les logs
docker-compose logs -f --tail=100

# 3. Vérifier les services individuellement
docker-compose logs gateway-pvvih
docker-compose logs gestion-user
docker-compose logs gestion-forum-front
```

**Services à vérifier:**
- ✅ api-register (Eureka) - Port 8761
- ✅ api-configuration - Port 8888
- ✅ gateway-pvvih - Port 8080
- ✅ gestion-user - Port 9089
- ✅ gestion-reference - Port 9090
- ✅ gestion-patient - Port 9091
- ✅ forum-pvvih - Port 9092
- ✅ gestion-forum-front - Port 3001
- ✅ a-reference-front - Port 3002
- ✅ a-user-front - Port 3003

---

### 🎯 ÉTAPE 9: TESTER L'APPLICATION

**Durée estimée:** 15 minutes

#### 1. Tester Eureka (Service Registry)
```
http://16.171.1.67:8761
```
**Attendu:** Page Eureka avec tous les services enregistrés

#### 2. Tester le Gateway
```
http://16.171.1.67:8080/actuator/health
```
**Attendu:** `{"status":"UP"}`

#### 3. Tester les Frontends
```
http://16.171.1.67:3001  # Forum
http://16.171.1.67:3002  # Reference
http://16.171.1.67:3003  # User Admin
```
**Attendu:** Pages d'accueil des applications

#### 4. Tester l'authentification
```bash
# Créer un utilisateur de test
curl -X POST http://16.171.1.67:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "email": "test@example.com",
    "password": "Test123!",
    "profil": "MEDECIN"
  }'

# Se connecter
curl -X POST http://16.171.1.67:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```
**Attendu:** Token JWT dans la réponse

#### 5. Tester la navigation entre frontends
- Ouvrir http://16.171.1.67:3001 (Forum)
- Cliquer sur "🚀 F1" → Devrait aller vers 16.171.1.67:3002
- Cliquer sur "🚀 F2" → Devrait aller vers 16.171.1.67:3003

---

### 🎯 ÉTAPE 10: MONITORING ET MAINTENANCE

**Commandes utiles:**

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f gateway-pvvih

# Redémarrer un service
docker-compose restart gateway-pvvih

# Arrêter tous les services
docker-compose down

# Redémarrer tous les services
docker-compose up -d

# Voir l'utilisation des ressources
docker stats

# Nettoyer les images inutilisées
docker system prune -a
```

---

## 📊 CHECKLIST FINALE

Avant de considérer le déploiement comme réussi, vérifiez:

### Configuration
- [ ] Configuration Gateway copiée dans GitHub
- [ ] Code poussé sur GitHub
- [ ] Fichier .env configuré sur AWS avec mots de passe sécurisés
- [ ] JWT_SECRET identique sur tous les services

### Services Backend
- [ ] Eureka accessible (http://16.171.1.67:8761)
- [ ] Gateway accessible (http://16.171.1.67:8080)
- [ ] Tous les services enregistrés dans Eureka
- [ ] Healthchecks OK pour tous les services

### Services Frontend
- [ ] Forum accessible (http://16.171.1.67:3001)
- [ ] Reference accessible (http://16.171.1.67:3002)
- [ ] User Admin accessible (http://16.171.1.67:3003)
- [ ] Navigation entre frontends fonctionne

### Fonctionnalités
- [ ] Inscription d'un utilisateur fonctionne
- [ ] Connexion fonctionne
- [ ] Token JWT est retourné
- [ ] CORS fonctionne (pas d'erreurs dans la console)
- [ ] API calls fonctionnent depuis les frontends

---

## 🆘 EN CAS DE PROBLÈME

### Problème: Services ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

### Problème: CORS errors
```bash
# Vérifier que la configuration Gateway est dans GitHub
# Vérifier les logs du Gateway
docker-compose logs gateway-pvvih | grep CORS

# Vérifier que CORS_ALLOWED_ORIGINS est bien passé
docker-compose exec gateway-pvvih env | grep CORS
```

### Problème: Frontends ne se connectent pas au backend
```bash
# Vérifier les variables d'environnement dans le build
docker-compose logs gestion-forum-front | grep REACT_APP

# Vérifier le contenu du bundle JavaScript
docker-compose exec gestion-forum-front cat /usr/share/nginx/html/static/js/main.*.js | grep "16.171.1.67"
```

### Problème: Base de données ne démarre pas
```bash
# Vérifier les logs
docker-compose logs mongodb
docker-compose logs mysql-user

# Vérifier les volumes
docker volume ls

# Supprimer et recréer les volumes (⚠️ PERTE DE DONNÉES)
docker-compose down -v
docker-compose up -d
```

---

## 📚 DOCUMENTATION UTILE

- `VERIFICATION_FINALE_AVANT_GITHUB.md` - Vérification complète
- `CONFIGURATION_GATEWAY_FINALE.md` - Configuration Gateway
- `CONFIGURATION_SECURITE_CORS.md` - Configuration CORS
- `CORRECTIONS_URLS_FRONTEND.md` - URLs frontend
- `VERIFICATION_NAVIGATION_FRONTENDS.md` - Navigation entre frontends
- `EXPLICATION_FICHIERS_ENV.md` - Explication des fichiers .env

---

## 🎉 APRÈS LE DÉPLOIEMENT

Une fois que tout fonctionne:

1. **Sauvegarder la configuration**
   ```bash
   # Sur AWS
   cp .env .env.backup
   ```

2. **Documenter les accès**
   - Noter l'IP publique
   - Noter les ports utilisés
   - Noter les mots de passe (dans un endroit sécurisé!)

3. **Configurer les sauvegardes**
   - Sauvegardes des bases de données
   - Snapshots AWS EC2

4. **Monitoring**
   - Configurer des alertes
   - Surveiller l'utilisation des ressources

5. **Sécurité**
   - Configurer un pare-feu
   - Mettre en place HTTPS (Let's Encrypt)
   - Restreindre l'accès SSH

---

## ⏱️ TEMPS TOTAL ESTIMÉ

- Configuration initiale: 1-2 heures
- Premier déploiement: 30-45 minutes
- Tests et validation: 30 minutes
- **Total: 2-3 heures**

---

## 🚀 VOUS ÊTES PRÊT!

Toutes les configurations sont en place. Suivez les étapes ci-dessus et votre application sera déployée sur AWS! 

Bonne chance! 🎉
