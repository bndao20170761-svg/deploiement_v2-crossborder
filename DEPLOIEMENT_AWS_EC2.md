# Guide de Déploiement sur AWS EC2

## 📋 Prérequis

Vous êtes connecté à votre instance EC2 Ubuntu :
```bash
ubuntu@ip-172-31-38-60:~$
```

## 🚀 Étape 1 : Installation des Dépendances

### 1.1 Mettre à jour le système

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Installer Docker

```bash
# Installer les dépendances
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter la clé GPG Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le repository Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Vérifier l'installation
docker --version

# Ajouter l'utilisateur ubuntu au groupe docker
sudo usermod -aG docker ubuntu

# Appliquer les changements (ou se reconnecter)
newgrp docker

# Tester Docker sans sudo
docker ps
```

### 1.3 Installer Docker Compose

```bash
# Télécharger Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker-compose --version
```

### 1.4 Installer Git

```bash
sudo apt install -y git
git --version
```

## 📦 Étape 2 : Cloner le Projet

```bash
# Cloner votre repository
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO

# OU si vous utilisez un repository privé
git clone https://VOTRE_TOKEN@github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO
```

## 🔧 Étape 3 : Configuration de l'Environnement

### 3.1 Créer le fichier .env pour la production

```bash
# Copier l'exemple
cp .env.example .env

# Éditer le fichier
nano .env
```

**Contenu du .env pour AWS :**

```bash
# Base de données MySQL - User
MYSQL_USER_ROOT_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_USER_DATABASE=user_db
MYSQL_USER_USER=user_app
MYSQL_USER_PASSWORD=VotreMotDePasseUser123!

# Base de données MySQL - Reference
MYSQL_REFERENCE_ROOT_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_REFERENCE_DATABASE=reference_db
MYSQL_REFERENCE_USER=reference_app
MYSQL_REFERENCE_PASSWORD=VotreMotDePasseReference123!

# Base de données MySQL - Patient
MYSQL_PATIENT_ROOT_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_PATIENT_DATABASE=patient_db
MYSQL_PATIENT_USER=patient_app
MYSQL_PATIENT_PASSWORD=VotreMotDePassePatient123!

# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=VotreMotDePasseMongo123!
MONGO_INITDB_DATABASE=forum_db

# JWT Secret (IMPORTANT: Même clé pour tous les services)
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789ABCDEFGHIJKLMNOP

# URLs publiques (remplacez par votre IP publique EC2)
PUBLIC_IP=54.123.45.67  # Votre IP publique EC2
GATEWAY_URL=http://54.123.45.67:8080
```

### 3.2 Obtenir votre IP publique EC2

```bash
# Méthode 1: Via AWS metadata
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Méthode 2: Via service externe
curl ifconfig.me

# Méthode 3: Via AWS CLI (si installé)
aws ec2 describe-instances --instance-ids $(ec2-metadata --instance-id | cut -d " " -f 2) --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```

## 🔐 Étape 4 : Configuration du Security Group AWS

### 4.1 Ports à ouvrir dans le Security Group

Connectez-vous à la console AWS EC2 et configurez le Security Group :

| Port | Service | Description |
|------|---------|-------------|
| 22 | SSH | Accès SSH |
| 80 | HTTP | Accès web (optionnel, pour nginx) |
| 443 | HTTPS | Accès web sécurisé (optionnel) |
| 8080 | Gateway | API Gateway principal |
| 8761 | Eureka | Service Discovery (optionnel en prod) |
| 8888 | Config Server | Configuration centralisée (optionnel) |
| 3001 | Frontend Forum | Interface forum |
| 3002 | Frontend Reference | Interface référence |
| 3003 | Frontend User | Interface utilisateur |

**Configuration minimale recommandée :**
- Port 22 : Votre IP uniquement
- Port 8080 : 0.0.0.0/0 (tout le monde)
- Ports 3001-3003 : 0.0.0.0/0 (tout le monde)

### 4.2 Commandes AWS CLI (optionnel)

```bash
# Installer AWS CLI
sudo apt install -y awscli

# Configurer AWS CLI
aws configure

# Ouvrir les ports nécessaires
SECURITY_GROUP_ID="sg-xxxxxxxxx"  # Remplacez par votre SG ID

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 8080 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 3001-3003 \
    --cidr 0.0.0.0/0
```

## 🐳 Étape 5 : Préparer Docker Compose pour la Production

### 5.1 Créer docker-compose.prod.yml (si pas déjà fait)

```bash
nano docker-compose.prod.yml
```

**Contenu optimisé pour AWS :**

```yaml
version: '3.8'

services:
  # Bases de données
  mysql-user:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_USER_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_USER_DATABASE}
      MYSQL_USER: ${MYSQL_USER_USER}
      MYSQL_PASSWORD: ${MYSQL_USER_PASSWORD}
    volumes:
      - mysql-user-data:/var/lib/mysql
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  mysql-reference:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_REFERENCE_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_REFERENCE_DATABASE}
      MYSQL_USER: ${MYSQL_REFERENCE_USER}
      MYSQL_PASSWORD: ${MYSQL_REFERENCE_PASSWORD}
    volumes:
      - mysql-reference-data:/var/lib/mysql
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  mysql-patient:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PATIENT_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_PATIENT_DATABASE}
      MYSQL_USER: ${MYSQL_PATIENT_USER}
      MYSQL_PASSWORD: ${MYSQL_PATIENT_PASSWORD}
    volumes:
      - mysql-patient-data:/var/lib/mysql
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE}
    volumes:
      - mongodb-data:/data/db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Services Backend (depuis DockerHub)
  api-register:
    image: VOTRE_DOCKERHUB_USERNAME/api-register:latest
    ports:
      - "8761:8761"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8761/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  api-configuration:
    image: VOTRE_DOCKERHUB_USERNAME/api-configuration:latest
    ports:
      - "8888:8888"
    environment:
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://api-register:8761/eureka/
    depends_on:
      - api-register
    restart: unless-stopped

  gateway-pvvih:
    image: VOTRE_DOCKERHUB_USERNAME/gateway-pvvih:latest
    ports:
      - "8080:8080"
    environment:
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://api-register:8761/eureka/
    depends_on:
      - api-register
    restart: unless-stopped

  gestion-user:
    image: VOTRE_DOCKERHUB_USERNAME/gestion-user:latest
    ports:
      - "9089:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql-user:3306/${MYSQL_USER_DATABASE}
      SPRING_DATASOURCE_USERNAME: ${MYSQL_USER_USER}
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_USER_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://api-register:8761/eureka/
    depends_on:
      - mysql-user
      - api-register
    restart: unless-stopped

  gestion-reference:
    image: VOTRE_DOCKERHUB_USERNAME/gestion-reference:latest
    ports:
      - "9090:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql-reference:3306/${MYSQL_REFERENCE_DATABASE}
      SPRING_DATASOURCE_USERNAME: ${MYSQL_REFERENCE_USER}
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_REFERENCE_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://api-register:8761/eureka/
    depends_on:
      - mysql-reference
      - api-register
    restart: unless-stopped

  gestion-patient:
    image: VOTRE_DOCKERHUB_USERNAME/gestion-patient:latest
    ports:
      - "9091:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql-patient:3306/${MYSQL_PATIENT_DATABASE}
      SPRING_DATASOURCE_USERNAME: ${MYSQL_PATIENT_USER}
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_PATIENT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://api-register:8761/eureka/
    depends_on:
      - mysql-patient
      - api-register
    restart: unless-stopped

  forum-pvvih:
    image: VOTRE_DOCKERHUB_USERNAME/forum-pvvih:latest
    ports:
      - "9092:8080"
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongodb:27017/${MONGO_INITDB_DATABASE}?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://api-register:8761/eureka/
    depends_on:
      - mongodb
      - api-register
    restart: unless-stopped

  # Frontends
  gestion-forum-front:
    image: VOTRE_DOCKERHUB_USERNAME/gestion-forum-front:latest
    ports:
      - "3001:80"
    environment:
      REACT_APP_API_URL: http://${PUBLIC_IP}:8080
    restart: unless-stopped

  a-reference-front:
    image: VOTRE_DOCKERHUB_USERNAME/a-reference-front:latest
    ports:
      - "3002:80"
    environment:
      REACT_APP_API_URL: http://${PUBLIC_IP}:8080
    restart: unless-stopped

  a-user-front:
    image: VOTRE_DOCKERHUB_USERNAME/a-user-front:latest
    ports:
      - "3003:80"
    environment:
      REACT_APP_API_URL: http://${PUBLIC_IP}:8080
    restart: unless-stopped

volumes:
  mysql-user-data:
  mysql-reference-data:
  mysql-patient-data:
  mongodb-data:
```

## 🚀 Étape 6 : Déploiement

### 6.1 Vérifier la configuration

```bash
# Vérifier que Docker fonctionne
docker ps

# Vérifier que docker-compose fonctionne
docker-compose --version

# Vérifier les fichiers
ls -la
cat .env
```

### 6.2 Lancer le déploiement

```bash
# Pull les images depuis DockerHub
docker-compose -f docker-compose.prod.yml pull

# Démarrer tous les services
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f

# Vérifier l'état des services
docker-compose -f docker-compose.prod.yml ps
```

### 6.3 Attendre que tous les services soient healthy

```bash
# Surveiller les health checks
watch -n 2 'docker-compose -f docker-compose.prod.yml ps'

# Vérifier les logs d'un service spécifique
docker-compose -f docker-compose.prod.yml logs -f gateway-pvvih
```

## 🧪 Étape 7 : Tests

### 7.1 Tester depuis l'instance EC2

```bash
# Tester le Gateway
curl http://localhost:8080/actuator/health

# Tester gestion-user
curl http://localhost:9089/actuator/health

# Tester gestion-reference
curl http://localhost:9090/actuator/health

# Créer un utilisateur
curl -X POST http://localhost:9089/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "nom": "Admin",
    "prenom": "Test",
    "nationalite": "SN"
  }'

# Se connecter
curl -X POST http://localhost:9089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 7.2 Tester depuis votre machine locale

Remplacez `54.123.45.67` par votre IP publique EC2 :

```bash
# Tester le Gateway
curl http://54.123.45.67:8080/actuator/health

# Accéder au frontend
http://54.123.45.67:3001  # Forum
http://54.123.45.67:3002  # Reference
http://54.123.45.67:3003  # User
```

## 📊 Étape 8 : Monitoring

### 8.1 Surveiller les ressources

```bash
# Voir l'utilisation des ressources
docker stats

# Voir les logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Voir l'état des services
docker-compose -f docker-compose.prod.yml ps
```

### 8.2 Eureka Dashboard

Accédez à http://VOTRE_IP:8761 pour voir tous les services enregistrés.

## 🔧 Étape 9 : Maintenance

### 9.1 Redémarrer un service

```bash
docker-compose -f docker-compose.prod.yml restart gateway-pvvih
```

### 9.2 Mettre à jour un service

```bash
# Pull la nouvelle image
docker-compose -f docker-compose.prod.yml pull gateway-pvvih

# Redémarrer le service
docker-compose -f docker-compose.prod.yml up -d gateway-pvvih
```

### 9.3 Voir les logs

```bash
# Tous les services
docker-compose -f docker-compose.prod.yml logs -f

# Un service spécifique
docker-compose -f docker-compose.prod.yml logs -f gestion-reference
```

### 9.4 Arrêter tous les services

```bash
docker-compose -f docker-compose.prod.yml down
```

### 9.5 Arrêter et supprimer les volumes (⚠️ ATTENTION: Perte de données)

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## 🔒 Étape 10 : Sécurité (Recommandations)

### 10.1 Configurer un pare-feu

```bash
# Installer UFW
sudo apt install -y ufw

# Autoriser SSH
sudo ufw allow 22/tcp

# Autoriser les ports nécessaires
sudo ufw allow 8080/tcp
sudo ufw allow 3001:3003/tcp

# Activer le pare-feu
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

### 10.2 Configurer HTTPS avec Let's Encrypt (optionnel)

```bash
# Installer Certbot
sudo apt install -y certbot

# Obtenir un certificat (nécessite un nom de domaine)
sudo certbot certonly --standalone -d votre-domaine.com
```

## 📝 Checklist de Déploiement

- [ ] Docker installé et fonctionnel
- [ ] Docker Compose installé
- [ ] Repository cloné
- [ ] Fichier .env configuré avec les bonnes valeurs
- [ ] IP publique EC2 obtenue
- [ ] Security Group configuré (ports ouverts)
- [ ] Images Docker disponibles sur DockerHub
- [ ] docker-compose.prod.yml configuré
- [ ] Services démarrés avec `docker-compose up -d`
- [ ] Tous les services sont "healthy"
- [ ] Tests d'API réussis
- [ ] Frontends accessibles depuis le navigateur

## 🆘 Dépannage

### Service ne démarre pas

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs SERVICE_NAME

# Redémarrer le service
docker-compose -f docker-compose.prod.yml restart SERVICE_NAME
```

### Problème de mémoire

```bash
# Voir l'utilisation
free -h
docker stats

# Augmenter la taille de l'instance EC2 si nécessaire
```

### Problème de connexion

```bash
# Vérifier que les ports sont ouverts
sudo netstat -tulpn | grep LISTEN

# Vérifier le Security Group AWS
# Vérifier le pare-feu local
sudo ufw status
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Spring Boot on AWS](https://spring.io/guides/gs/spring-boot-docker/)
