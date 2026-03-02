# 🚀 Quick Start - Déploiement AWS EC2

## Vous êtes ici : `ubuntu@ip-172-31-38-60:~$`

## ⚡ Installation Rapide (5 minutes)

### Étape 1 : Installer les dépendances

```bash
# Télécharger le script d'installation
wget https://raw.githubusercontent.com/VOTRE_REPO/main/setup-aws-ec2.sh

# Ou si vous avez déjà cloné le repo
cd votre-projet
bash setup-aws-ec2.sh

# Reconnectez-vous pour appliquer les changements Docker
exit
# Puis reconnectez-vous en SSH
```

### Étape 2 : Cloner le projet (si pas déjà fait)

```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO
```

### Étape 3 : Configurer l'environnement

```bash
# Copier l'exemple
cp .env.example .env

# Éditer le fichier
nano .env
```

**Configuration minimale requise dans .env :**

```bash
# Mots de passe des bases de données
MYSQL_USER_ROOT_PASSWORD=VotreMotDePasse123!
MYSQL_REFERENCE_ROOT_PASSWORD=VotreMotDePasse123!
MYSQL_PATIENT_ROOT_PASSWORD=VotreMotDePasse123!
MONGO_INITDB_ROOT_PASSWORD=VotreMotDePasse123!

# JWT Secret (IMPORTANT: Même clé partout)
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789

# IP publique (sera ajoutée automatiquement par le script)
PUBLIC_IP=
```

Sauvegardez avec `Ctrl+X`, puis `Y`, puis `Enter`

### Étape 4 : Configurer le Security Group AWS

**Via Console AWS :**
1. Allez dans EC2 → Security Groups
2. Sélectionnez votre Security Group
3. Ajoutez ces règles Inbound :

| Type | Port | Source | Description |
|------|------|--------|-------------|
| Custom TCP | 8080 | 0.0.0.0/0 | Gateway API |
| Custom TCP | 3001 | 0.0.0.0/0 | Frontend Forum |
| Custom TCP | 3002 | 0.0.0.0/0 | Frontend Reference |
| Custom TCP | 3003 | 0.0.0.0/0 | Frontend User |
| Custom TCP | 8761 | 0.0.0.0/0 | Eureka (optionnel) |

### Étape 5 : Déployer

```bash
# Lancer le déploiement
bash deploy-aws.sh

# Ou manuellement
docker-compose -f docker-compose.prod.yml up -d
```

### Étape 6 : Vérifier

```bash
# Voir l'état des services
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Tester l'API
curl http://localhost:8080/actuator/health
```

## 🌐 Accéder à votre application

Remplacez `54.123.45.67` par votre IP publique EC2 :

```bash
# Obtenir votre IP publique
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

**URLs d'accès :**
- Gateway API: http://54.123.45.67:8080
- Frontend Forum: http://54.123.45.67:3001
- Frontend Reference: http://54.123.45.67:3002
- Frontend User: http://54.123.45.67:3003
- Eureka Dashboard: http://54.123.45.67:8761

## 🧪 Test Rapide

```bash
# Créer un utilisateur
curl -X POST http://localhost:8080/api/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "nom": "Admin",
    "prenom": "Test",
    "nationalite": "SN"
  }'

# Se connecter
curl -X POST http://localhost:8080/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

## 📊 Commandes Utiles

```bash
# Voir les logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Voir l'utilisation des ressources
docker stats

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart gateway-pvvih

# Arrêter tous les services
docker-compose -f docker-compose.prod.yml down

# Mettre à jour un service
docker-compose -f docker-compose.prod.yml pull gateway-pvvih
docker-compose -f docker-compose.prod.yml up -d gateway-pvvih
```

## 🐛 Dépannage Rapide

### Service ne démarre pas
```bash
docker-compose -f docker-compose.prod.yml logs SERVICE_NAME
```

### Problème de connexion
```bash
# Vérifier les ports ouverts
sudo netstat -tulpn | grep LISTEN

# Vérifier le Security Group AWS
# Vérifier que l'IP publique est correcte
curl ifconfig.me
```

### Manque de mémoire
```bash
# Voir l'utilisation
free -h
docker stats

# Augmenter la taille de l'instance EC2 si nécessaire
```

## 📚 Documentation Complète

- `DEPLOIEMENT_AWS_EC2.md` - Guide complet
- `ARCHITECTURE_AUTHENTIFICATION.md` - Architecture d'authentification
- `GUIDE_TEST_API.md` - Guide de test des APIs

## 🆘 Besoin d'aide ?

1. Vérifiez les logs : `docker-compose -f docker-compose.prod.yml logs -f`
2. Vérifiez l'état : `docker-compose -f docker-compose.prod.yml ps`
3. Consultez la documentation complète : `DEPLOIEMENT_AWS_EC2.md`
