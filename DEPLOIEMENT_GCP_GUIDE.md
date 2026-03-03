# 🚀 Guide de Déploiement Google Cloud Platform - Étape par Étape

## 📍 Votre Configuration GCP

**IP Externe:** `34.133.155.230`  
**Nom de la VM:** `springboot-server`  
**Système:** Debian GNU/Linux

---

## ✅ Étape 1: Installation de Docker (À faire sur la VM)

Connectez-vous à votre VM via SSH et exécutez:

```bash
# 1. Tuer tous les processus apt/dpkg en cours
sudo killall -9 apt apt-get dpkg

# 2. Attendre 5 secondes
sleep 5

# 3. Nettoyer tous les fichiers de lock
sudo rm -f /var/lib/apt/lists/lock
sudo rm -f /var/lib/dpkg/lock*
sudo rm -f /var/cache/apt/archives/lock

# 4. Reconfigurer dpkg
sudo dpkg --configure -a

# 5. Mettre à jour
sudo apt update

# 6. Installer Docker
sudo apt install -y docker.io

# 7. Démarrer et activer Docker
sudo systemctl start docker
sudo systemctl enable docker

# 8. Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# 9. Vérifier les installations
docker --version
docker-compose --version
```

### Redémarrer la session SSH

Pour que les permissions Docker prennent effet:

```bash
# Se déconnecter
exit
```

Puis reconnectez-vous et vérifiez:

```bash
# Tester Docker sans sudo
docker run hello-world
```

---

## 📦 Étape 2: Cloner le Repository

```bash
# Installer git si nécessaire
sudo apt install -y git

# Cloner votre repository
git clone https://github.com/VOTRE_USERNAME/deploiement_v2-crossborder.git

# Entrer dans le répertoire
cd deploiement_v2-crossborder

# Vérifier que tous les fichiers sont présents
ls -la
```

**Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub.**

---

## 🔧 Étape 3: Configurer l'Environnement

### 3.1 Créer le fichier .env

```bash
# Copier l'exemple GCP
cp .env.gcp.example .env

# Vérifier le contenu
cat .env
```

Le fichier `.env` contient déjà la bonne IP: `34.133.155.230`

### 3.2 (Optionnel) Modifier les mots de passe

Si vous voulez changer les mots de passe par défaut:

```bash
# Éditer le fichier
nano .env
```

Changez les valeurs de:
- `MONGO_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_USER_PASSWORD`
- `MYSQL_REFERENCE_PASSWORD`
- `MYSQL_PATIENT_PASSWORD`

**NE CHANGEZ PAS `JWT_SECRET` - il doit rester identique!**

Sauvegardez avec `Ctrl+X`, puis `Y`, puis `Enter`.

---

## 🏗️ Étape 4: Déploiement Pas à Pas

### 4.1 Démarrer les Bases de Données

```bash
# Démarrer MongoDB et MySQL
docker-compose up -d mongodb mysql-user mysql-reference mysql-patient

# Vérifier qu'elles sont bien démarrées
docker-compose ps

# Attendre 30 secondes que les bases soient prêtes
sleep 30

# Vérifier les logs
docker-compose logs mongodb mysql-user
```

Vous devriez voir les bases de données avec le statut "Up" et "healthy".

### 4.2 Démarrer les Services Edge (Eureka, Config, Gateway)

```bash
# Démarrer les services d'infrastructure
docker-compose up -d api-register api-configuration gateway-pvvih

# Vérifier l'état
docker-compose ps

# Attendre 60 secondes
sleep 60

# Vérifier les logs
docker-compose logs api-register gateway-pvvih
```

### 4.3 Démarrer les Services Backend

```bash
# Démarrer tous les services backend
docker-compose up -d forum-pvvih gestion-user gestion-reference gestion-patient

# Vérifier l'état
docker-compose ps

# Attendre 90 secondes
sleep 90

# Vérifier les logs
docker-compose logs gestion-user gestion-reference
```

### 4.4 Démarrer les Frontends

```bash
# Démarrer tous les frontends
docker-compose up -d gestion-forum-front a-reference-front a-user-front

# Vérifier l'état final
docker-compose ps

# Voir tous les conteneurs en cours
docker ps
```

---

## 🧪 Étape 5: Tester l'Application

### 5.1 Vérifier les Health Checks (depuis la VM)

```bash
# Gateway
curl http://localhost:8080/actuator/health

# Service User
curl http://localhost:9089/actuator/health

# Service Reference
curl http://localhost:9090/actuator/health

# Service Patient
curl http://localhost:9091/actuator/health

# Service Forum
curl http://localhost:9092/actuator/health
```

Tous doivent retourner: `{"status":"UP"}`

### 5.2 Tester depuis votre navigateur

Ouvrez ces URLs dans votre navigateur:

```
Gateway API:        http://34.133.155.230:8080
Eureka Dashboard:   http://34.133.155.230:8761
Frontend Forum:     http://34.133.155.230:3001
Frontend Reference: http://34.133.155.230:3002
Frontend User:      http://34.133.155.230:3003
```

### 5.3 Tester l'API d'authentification

Depuis votre machine locale (PowerShell):

```powershell
# Créer un utilisateur
Invoke-RestMethod -Uri "http://34.133.155.230:8080/api/user-auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin@test.com","password":"admin123","nom":"Admin","prenom":"Test","profil":"ADMIN","nationalite":"Sénégalaise","actif":true}'

# Se connecter
Invoke-RestMethod -Uri "http://34.133.155.230:8080/api/user-auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin@test.com","password":"admin123"}'
```

---

## 📊 Étape 6: Monitoring

### Voir tous les conteneurs

```bash
docker-compose ps
```

### Voir les logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f gateway-pvvih
docker-compose logs -f gestion-user
```

### Voir l'utilisation des ressources

```bash
# CPU et mémoire par conteneur
docker stats

# Espace disque
df -h

# Mémoire système
free -h
```

---

## 🛑 Commandes Utiles

### Redémarrer un service

```bash
docker-compose restart gateway-pvvih
docker-compose restart gestion-user
```

### Arrêter tous les services

```bash
docker-compose down
```

### Redémarrer tous les services

```bash
docker-compose restart
```

### Voir les logs d'un service

```bash
docker-compose logs -f SERVICE_NAME
```

### Nettoyer les ressources Docker

```bash
# Supprimer les conteneurs arrêtés
docker container prune -f

# Supprimer les images inutilisées
docker image prune -a -f

# Nettoyer tout (attention!)
docker system prune -a -f
```

---

## 🐛 Dépannage

### Problème: Service ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs SERVICE_NAME

# Redémarrer le service
docker-compose restart SERVICE_NAME

# Reconstruire et redémarrer
docker-compose up -d --build SERVICE_NAME
```

### Problème: Erreur de connexion à la base de données

```bash
# Vérifier que les bases sont healthy
docker-compose ps

# Redémarrer les bases
docker-compose restart mongodb mysql-user mysql-reference mysql-patient

# Attendre 30 secondes
sleep 30

# Redémarrer les services backend
docker-compose restart forum-pvvih gestion-user gestion-reference gestion-patient
```

### Problème: Port déjà utilisé

```bash
# Voir les ports utilisés
sudo netstat -tulpn | grep LISTEN

# Arrêter le processus qui utilise le port
sudo kill -9 PID
```

### Problème: Manque de mémoire

```bash
# Voir l'utilisation
free -h
docker stats

# Arrêter les services non essentiels
docker-compose stop SERVICE_NAME
```

---

## 🎯 URLs d'Accès Final

| Service | URL |
|---------|-----|
| Gateway API | http://34.133.155.230:8080 |
| Eureka Dashboard | http://34.133.155.230:8761 |
| Frontend Forum | http://34.133.155.230:3001 |
| Frontend Reference | http://34.133.155.230:3002 |
| Frontend User | http://34.133.155.230:3003 |

---

## 📋 Checklist de Déploiement

- [ ] Docker installé et fonctionnel
- [ ] Repository cloné
- [ ] Fichier .env créé avec la bonne IP GCP
- [ ] Bases de données démarrées et healthy
- [ ] Services edge démarrés (Eureka, Config, Gateway)
- [ ] Services backend démarrés
- [ ] Frontends démarrés
- [ ] Health checks réussis
- [ ] Tests d'API réussis (register/login)
- [ ] Frontends accessibles depuis le navigateur
- [ ] Eureka Dashboard affiche tous les services

---

## 🔒 Règles de Pare-feu GCP

Assurez-vous que ces ports sont ouverts dans votre règle de pare-feu:

- **8080** - Gateway API
- **3001** - Frontend Forum
- **3002** - Frontend Reference
- **3003** - Frontend User

Nom de la règle: `allow-pvvih-app-ports`

---

## 📚 Documentation Complémentaire

- `ARCHITECTURE_AUTHENTIFICATION.md` - Architecture d'authentification
- `GUIDE_TEST_API.md` - Guide de test des APIs
- `.env.gcp.example` - Configuration GCP

---

**Bon déploiement sur Google Cloud! 🚀**
