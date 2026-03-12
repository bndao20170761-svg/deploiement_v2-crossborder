# 🚀 Configuration Nouvelle Instance GCP - Guide Rapide

## Option 1: Installation Automatique (Recommandé)

### Sur votre nouvelle instance GCP, exécutez:

```bash
# Télécharger et exécuter le script d'installation
wget https://raw.githubusercontent.com/bndao20170761-svg/deploiement_v2-crossborder/main/setup-new-gcp-instance.sh
bash setup-new-gcp-instance.sh
```

**Puis déconnectez-vous et reconnectez-vous!**

```bash
exit
# Reconnectez-vous via SSH
```

**Ensuite:**
```bash
cd deploiement_v2-crossborder
./clean-rebuild-all.sh
```

---

## Option 2: Installation Manuelle Rapide

### 1️⃣ Installer Docker et Git
```bash
# Mise à jour
sudo apt-get update && sudo apt-get upgrade -y

# Installer Git
sudo apt-get install -y git

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# IMPORTANT: Déconnectez-vous et reconnectez-vous!
exit
```

### 2️⃣ Cloner le projet
```bash
git clone https://github.com/bndao20170761-svg/deploiement_v2-crossborder.git
cd deploiement_v2-crossborder
```

### 3️⃣ Configurer l'environnement
```bash
# Copier le fichier .env
cp .env.example .env

# Obtenir votre IP
curl ifconfig.me

# Éditer .env et remplacer 34.32.116.206 par votre IP
nano .env
```

### 4️⃣ Configurer le pare-feu GCP

**Dans la console GCP:**
- VPC Network > Firewall > Create Firewall Rule
- **Ports à ouvrir**: 8080, 8761, 8888, 3001, 3002, 3003, 9089-9092

**Ou via gcloud CLI:**
```bash
gcloud compute firewall-rules create allow-pvvih \
  --allow tcp:8080,tcp:8761,tcp:8888,tcp:3001,tcp:3002,tcp:3003,tcp:9089-9092 \
  --source-ranges 0.0.0.0/0
```

### 5️⃣ Déployer
```bash
# Construire et démarrer
docker compose build
docker compose up -d

# Vérifier
docker compose ps
docker compose logs -f
```

---

## 🔍 Vérification Rapide

```bash
# État des services
docker compose ps

# Logs
docker compose logs -f gateway-pvvih

# Tester
curl http://localhost:8080/actuator/health
```

**Accès externe:**
- Forum: http://VOTRE_IP:3001
- Référence: http://VOTRE_IP:3002
- Utilisateur: http://VOTRE_IP:3003
- Gateway: http://VOTRE_IP:8080

---

## 🆘 Problèmes Courants

### "Permission denied" avec Docker
```bash
# Vous avez oublié de vous reconnecter!
exit
# Reconnectez-vous
```

### Services ne démarrent pas
```bash
# Vérifier les logs
docker compose logs api-register

# Redémarrer
docker compose restart
```

### Nettoyer et recommencer
```bash
docker compose down
docker system prune -af --volumes
docker compose up -d
```

---

## 📋 Checklist

- [ ] Instance GCP créée
- [ ] Git installé
- [ ] Docker installé
- [ ] Reconnexion effectuée après installation Docker
- [ ] Projet cloné
- [ ] Fichier .env configuré
- [ ] Pare-feu GCP configuré
- [ ] Services déployés
- [ ] Applications accessibles

---

**Pour plus de détails, consultez GUIDE_NOUVELLE_INSTANCE.md**
