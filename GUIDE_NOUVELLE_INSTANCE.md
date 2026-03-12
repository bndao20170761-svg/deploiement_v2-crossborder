# Guide de Configuration - Nouvelle Instance GCP

## 📋 Prérequis
- Une nouvelle instance GCP Ubuntu 20.04 ou 22.04
- Accès SSH à l'instance
- Connexion Internet

## 🚀 Installation Rapide (Méthode Automatique)

### Étape 1: Connectez-vous à votre instance GCP
```bash
# Via la console GCP ou SSH
ssh votre-utilisateur@VOTRE_IP_EXTERNE
```

### Étape 2: Téléchargez le script d'installation
```bash
# Télécharger le script depuis votre dépôt
wget https://raw.githubusercontent.com/bndao20170761-svg/deploiement_v2-crossborder/main/setup-new-gcp-instance.sh

# Ou si vous avez déjà cloné le projet
cd deploiement_v2-crossborder
chmod +x setup-new-gcp-instance.sh
```

### Étape 3: Exécutez le script
```bash
bash setup-new-gcp-instance.sh
```

Le script va:
- ✅ Mettre à jour le système
- ✅ Installer Git
- ✅ Installer Docker et Docker Compose
- ✅ Cloner votre projet
- ✅ Créer et configurer le fichier .env avec votre IP

### Étape 4: Reconnectez-vous
```bash
exit
# Puis reconnectez-vous via SSH
```

### Étape 5: Lancez le déploiement
```bash
cd deploiement_v2-crossborder
chmod +x clean-rebuild-all.sh
./clean-rebuild-all.sh
```

---

## 🔧 Installation Manuelle (Étape par Étape)

Si vous préférez installer manuellement:

### 1. Mise à jour du système
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Installation de Git
```bash
sudo apt-get install -y git
git --version

# Configuration (optionnel)
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"
```

### 3. Installation de Docker
```bash
# Supprimer les anciennes versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Installer les dépendances
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Ajouter la clé GPG de Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Ajouter le dépôt Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Vérifier l'installation
docker --version
docker compose version
```

### 4. Reconnexion (IMPORTANT!)
```bash
exit
# Reconnectez-vous pour que les changements prennent effet
```

### 5. Cloner le projet
```bash
git clone https://github.com/bndao20170761-svg/deploiement_v2-crossborder.git
cd deploiement_v2-crossborder
```

### 6. Configurer l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Obtenir votre IP externe
curl ifconfig.me

# Éditer le fichier .env
nano .env
# Remplacez 34.32.116.206 par votre IP externe
```

### 7. Configurer le pare-feu GCP
Dans la console GCP:
1. Allez dans **VPC Network** > **Firewall**
2. Cliquez sur **Create Firewall Rule**
3. Créez une règle avec ces paramètres:
   - **Name**: allow-pvvih-ports
   - **Direction**: Ingress
   - **Targets**: All instances in the network
   - **Source IP ranges**: 0.0.0.0/0
   - **Protocols and ports**: 
     - tcp:8080,8761,8888,3001,3002,3003,9089,9090,9091,9092

### 8. Déployer l'application
```bash
# Option 1: Avec le script de nettoyage complet
chmod +x clean-rebuild-all.sh
./clean-rebuild-all.sh

# Option 2: Avec docker-compose directement
docker compose build
docker compose up -d
```

---

## 📊 Vérification du Déploiement

### Vérifier l'état des services
```bash
docker compose ps
```

### Voir les logs
```bash
# Tous les services
docker compose logs -f

# Un service spécifique
docker logs api-register
docker logs gateway-pvvih
docker logs gestion-user
```

### Tester les endpoints
```bash
# Eureka (Service Registry)
curl http://localhost:8761

# Config Server
curl http://localhost:8888/actuator/health

# Gateway
curl http://localhost:8080/actuator/health

# Depuis l'extérieur (remplacez VOTRE_IP)
curl http://VOTRE_IP:8080/actuator/health
```

### Accéder aux applications
- **Forum**: http://VOTRE_IP:3001
- **Référence**: http://VOTRE_IP:3002
- **Utilisateur**: http://VOTRE_IP:3003
- **Gateway**: http://VOTRE_IP:8080
- **Eureka**: http://VOTRE_IP:8761

---

## 🔍 Dépannage

### Docker ne fonctionne pas
```bash
# Vérifier que vous êtes dans le groupe docker
groups

# Si 'docker' n'apparaît pas, reconnectez-vous
exit
# Puis reconnectez-vous
```

### Les services ne démarrent pas
```bash
# Vérifier les logs
docker compose logs api-register
docker compose logs gateway-pvvih

# Redémarrer un service spécifique
docker compose restart api-register

# Tout redémarrer
docker compose down
docker compose up -d
```

### Problème de mémoire
```bash
# Vérifier l'utilisation de la mémoire
free -h
docker stats

# Si nécessaire, augmenter la taille de l'instance GCP
```

### Nettoyer et recommencer
```bash
# Arrêter tout
docker compose down

# Nettoyer complètement
docker system prune -af --volumes

# Reconstruire
docker compose build --no-cache
docker compose up -d
```

---

## 📝 Commandes Utiles

```bash
# Voir tous les conteneurs
docker ps -a

# Voir toutes les images
docker images

# Voir l'utilisation des ressources
docker stats

# Arrêter tous les services
docker compose down

# Démarrer tous les services
docker compose up -d

# Reconstruire un service spécifique
docker compose build api-register
docker compose up -d api-register

# Voir les logs en temps réel
docker compose logs -f gateway-pvvih

# Exécuter une commande dans un conteneur
docker exec -it api-register bash

# Nettoyer les ressources inutilisées
docker system prune -a
```

---

## 🎯 Checklist de Déploiement

- [ ] Instance GCP créée et accessible
- [ ] Système mis à jour
- [ ] Git installé
- [ ] Docker installé
- [ ] Docker Compose installé
- [ ] Utilisateur ajouté au groupe docker
- [ ] Reconnexion effectuée
- [ ] Projet cloné
- [ ] Fichier .env configuré avec la bonne IP
- [ ] Règles de pare-feu GCP configurées
- [ ] Services déployés avec docker-compose
- [ ] Services en état "healthy"
- [ ] Applications accessibles depuis l'extérieur

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs: `docker compose logs -f`
2. Vérifiez l'état: `docker compose ps`
3. Consultez le fichier GUIDE_DEPANNAGE_GCP.md
4. Vérifiez que tous les ports sont ouverts dans GCP

---

**Bonne chance avec votre déploiement! 🚀**
