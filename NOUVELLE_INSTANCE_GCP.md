# 🚀 Guide de Configuration - Nouvelle Instance GCP

## 📋 Ce que vous devez faire maintenant

Vous avez créé une nouvelle instance GCP. Voici les étapes à suivre:

---

## 🎯 ÉTAPE 1: Récupérer l'IP de votre nouvelle instance

1. Allez sur la console GCP: https://console.cloud.google.com
2. Naviguez vers: **Compute Engine** > **Instances de VM**
3. Notez l'**IP externe** de votre nouvelle instance
   - Exemple: `34.32.116.206`

---

## 🔧 ÉTAPE 2: Configurer les règles de pare-feu

### Option A: Via la Console GCP (Recommandé)

1. Allez dans: **VPC Network** > **Firewall**
2. Cliquez sur **CREATE FIREWALL RULE**
3. Configurez:
   - **Name:** `allow-pvvih-app-ports`
   - **Direction:** Ingress
   - **Action on match:** Allow
   - **Targets:** All instances in the network
   - **Source IP ranges:** `0.0.0.0/0`
   - **Protocols and ports:** 
     - TCP: `8080, 8761, 3001, 3002, 3003`
4. Cliquez sur **CREATE**

### Option B: Via gcloud CLI

```bash
gcloud compute firewall-rules create allow-pvvih-app-ports \
  --allow tcp:8080,tcp:8761,tcp:3001,tcp:3002,tcp:3003 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow PVVIH application ports"
```

---

## 💻 ÉTAPE 3: Se connecter à votre instance

### Via la Console GCP

1. Allez dans **Compute Engine** > **Instances de VM**
2. Cliquez sur **SSH** à côté de votre instance

### Via Terminal (si vous avez configuré SSH)

```bash
gcloud compute ssh VOTRE_INSTANCE_NAME --zone=VOTRE_ZONE
```

---

## 📦 ÉTAPE 4: Transférer les scripts sur votre instance

### Option A: Cloner depuis GitHub (Recommandé)

```bash
# Sur votre instance GCP
git clone https://github.com/VOTRE_USERNAME/deploiement_v2-crossborder.git
cd deploiement_v2-crossborder
```

**Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub**

### Option B: Transférer depuis votre machine locale

```bash
# Depuis votre machine locale
gcloud compute scp setup-nouvelle-instance-gcp.sh VOTRE_INSTANCE:~/ --zone=VOTRE_ZONE
gcloud compute scp deploy-gcp-complet.sh VOTRE_INSTANCE:~/ --zone=VOTRE_ZONE
```

---

## 🚀 ÉTAPE 5: Exécuter le script de configuration

Sur votre instance GCP, exécutez:

```bash
# Remplacez VOTRE_IP_PUBLIQUE par l'IP externe de votre instance
bash setup-nouvelle-instance-gcp.sh VOTRE_IP_PUBLIQUE
```

**Exemple:**
```bash
bash setup-nouvelle-instance-gcp.sh 34.32.116.206
```

Ce script va:
- ✅ Installer Docker et Docker Compose
- ✅ Cloner le repository (si pas déjà fait)
- ✅ Créer le fichier `.env` avec votre IP
- ✅ Configurer les permissions

---

## 🔄 ÉTAPE 6: Redémarrer la session SSH

Après l'exécution du script:

```bash
# Se déconnecter
exit
```

Puis reconnectez-vous via SSH pour activer les permissions Docker.

---

## 🎬 ÉTAPE 7: Lancer le déploiement

Une fois reconnecté:

```bash
# Aller dans le répertoire
cd deploiement_v2-crossborder

# Tester Docker
docker run hello-world

# Lancer le déploiement complet
bash deploy-gcp-complet.sh
```

Le script va déployer automatiquement:
1. Les bases de données (MongoDB, MySQL)
2. Les services Edge (Eureka, Config Server, Gateway)
3. Les services Backend (User, Reference, Patient, Forum)
4. Les Frontends (Forum, Reference, User)

**Temps estimé:** 50-60 minutes

---

## ✅ ÉTAPE 8: Vérifier le déploiement

### Vérifier l'état des services

```bash
docker-compose ps
```

Tous les services doivent être "Up" et "healthy".

### Tester les URLs

Ouvrez dans votre navigateur (remplacez par votre IP):

```
http://VOTRE_IP:8080      # Gateway API
http://VOTRE_IP:8761      # Eureka Dashboard
http://VOTRE_IP:3001      # Frontend Forum
http://VOTRE_IP:3002      # Frontend Reference
http://VOTRE_IP:3003      # Frontend User
```

### Tester l'API

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

---

## 📊 Monitoring

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
# CPU et mémoire
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
docker-compose restart SERVICE_NAME
```

### Arrêter tous les services

```bash
docker-compose down
```

### Nettoyer les ressources

```bash
# Supprimer les conteneurs arrêtés
docker container prune -f

# Supprimer les images inutilisées
docker image prune -a -f

# Nettoyer tout
docker system prune -a -f
```

---

## 🐛 Dépannage

### Si un service ne démarre pas

```bash
# Voir les logs
docker-compose logs SERVICE_NAME

# Redémarrer
docker-compose restart SERVICE_NAME

# Reconstruire
docker-compose build --no-cache SERVICE_NAME
docker-compose up -d SERVICE_NAME
```

### Si le Gateway ne fonctionne pas

```bash
# Vérifier les dépendances
docker-compose ps api-register api-configuration

# Redémarrer dans l'ordre
docker-compose restart api-register
sleep 30
docker-compose restart api-configuration
sleep 30
docker-compose restart gateway-pvvih
```

### Si une base de données ne démarre pas

```bash
# Voir les logs
docker-compose logs mongodb

# Redémarrer
docker-compose restart mongodb

# Vérifier l'espace disque
df -h
```

---

## 📋 Checklist Complète

- [ ] Instance GCP créée
- [ ] IP externe notée
- [ ] Règles de pare-feu configurées (ports 8080, 8761, 3001-3003)
- [ ] Connexion SSH établie
- [ ] Script de configuration exécuté
- [ ] Session SSH redémarrée
- [ ] Docker fonctionnel (test avec hello-world)
- [ ] Déploiement complet lancé
- [ ] Tous les services "Up" et "healthy"
- [ ] Gateway accessible (http://IP:8080)
- [ ] Eureka Dashboard accessible (http://IP:8761)
- [ ] Frontends accessibles (http://IP:3001-3003)
- [ ] Test API réussi (register/login)

---

## 🎯 Résumé des Commandes

```bash
# 1. Sur votre instance GCP
bash setup-nouvelle-instance-gcp.sh VOTRE_IP_PUBLIQUE

# 2. Se déconnecter et reconnecter
exit

# 3. Tester Docker
docker run hello-world

# 4. Lancer le déploiement
cd deploiement_v2-crossborder
bash deploy-gcp-complet.sh

# 5. Vérifier
docker-compose ps
docker-compose logs -f
```

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs: `docker-compose logs -f`
2. Vérifiez l'état: `docker-compose ps`
3. Vérifiez les ressources: `docker stats` et `free -h`
4. Consultez: `DEPLOIEMENT_GCP_GUIDE.md` pour plus de détails

---

**Bon déploiement! 🚀**
