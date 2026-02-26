# 🎯 COMMENCER ICI - Guide de Démarrage

## Bienvenue !

Ce guide vous aidera à déployer rapidement votre système de microservices PVVIH.

## ⚡ Démarrage en 3 Étapes

### Étape 1️⃣ : Vérifier la Configuration

Ouvrez PowerShell dans ce dossier et exécutez :

```powershell
.\verify-github-config.ps1
```

**Ce script vérifie :**
- ✅ Que votre dépôt Git local existe
- ✅ Que tous les fichiers de configuration sont présents
- ✅ Que vos modifications sont synchronisées avec GitHub

**Si tout est OK**, passez à l'étape 2.

**Si des fichiers manquent** :
1. Ajoutez-les dans : `C:\Users\babac\cloud-config-repo\cloud-config-repo-enda`
2. Commitez et poussez : `git add . && git commit -m "Config" && git push`
3. Relancez le script de vérification

---

### Étape 2️⃣ : Déployer le Système

```powershell
.\deploy-and-verify.ps1
```

**Ce script va :**
- 🛑 Arrêter les services existants
- 🔨 Reconstruire le Config Server
- 🚀 Démarrer tous les services
- ⏳ Attendre que le Config Server clone GitHub
- ✅ Vérifier que les configurations sont chargées
- 🔄 Redémarrer les microservices
- 📊 Afficher l'état final

**Durée estimée :** 3-5 minutes

---

### Étape 3️⃣ : Vérifier que Tout Fonctionne

```powershell
.\check-system-status.ps1
```

**Ce script vérifie :**
- ✅ Docker est actif
- ✅ Tous les conteneurs sont démarrés
- ✅ Config Server fonctionne
- ✅ Eureka fonctionne
- ✅ Services sont enregistrés
- ✅ Gateway est actif
- ✅ Bases de données sont actives

---

## 🌐 Accéder aux Services

Une fois le déploiement terminé, ouvrez votre navigateur :

### Tableaux de Bord
- **Eureka** (voir les services) : http://localhost:8761
- **Config Server** (santé) : http://localhost:8888/actuator/health

### Applications Frontend
- **Forum** : http://localhost:3001
- **Référencement** : http://localhost:3002
- **Gestion Utilisateurs** : http://localhost:3003

### API Gateway
- **Point d'entrée unique** : http://localhost:8080

---

## 🛠️ Commandes Rapides

### Voir les Logs

```bash
# Tous les logs
docker-compose logs -f

# Un service spécifique
docker logs forum-pvvih -f
docker logs api-configuration -f
```

### Redémarrer un Service

```bash
docker-compose restart <nom-service>

# Exemples
docker-compose restart forum-pvvih
docker-compose restart api-configuration
```

### Arrêter Tout

```bash
docker-compose down
```

### Redémarrer Tout

```bash
docker-compose restart
```

---

## ❓ Problèmes Courants

### "Could not resolve placeholder"

**Cause :** Le service ne peut pas charger sa configuration.

**Solution :**
```bash
# Vérifier le Config Server
curl http://localhost:8888/actuator/health

# Attendre 30 secondes puis redémarrer le service
docker-compose restart <nom-service>
```

### Config Server ne démarre pas

**Solution :**
```bash
# Voir les logs
docker logs api-configuration

# Vérifier GitHub
.\verify-github-config.ps1

# Redémarrer
docker-compose restart api-configuration
```

### Services ne s'enregistrent pas dans Eureka

**Solution :**
```bash
# Redémarrer tout
docker-compose restart
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

- **README.md** : Vue d'ensemble du projet
- **LISEZMOI_DEPLOIEMENT.md** : Guide complet de déploiement
- **CONFIGURATION_FINALE_GITHUB.md** : Documentation technique

---

## 🎓 Comprendre l'Architecture

```
GitHub (Configuration)
    ↓
Config Server (Port 8888)
    ↓
Eureka (Service Registry - Port 8761)
    ↓
API Gateway (Port 8080)
    ↓
┌─────────┬──────────┬──────────┬───────────┐
│ Forum   │ User     │ Patient  │ Reference │
│ (9092)  │ (9089)   │ (9091)   │ (9090)    │
└─────────┴──────────┴──────────┴───────────┘
    ↓           ↓          ↓          ↓
┌─────────┬──────────┬──────────┬───────────┐
│ MongoDB │ MySQL    │ MySQL    │ MySQL     │
│ (27017) │ (3307)   │ (3309)   │ (3308)    │
└─────────┴──────────┴──────────┴───────────┘
```

---

## ✅ Checklist Avant de Commencer

- [ ] Docker Desktop est installé et démarré
- [ ] Connexion Internet active (pour GitHub)
- [ ] Ports disponibles (8080, 8761, 8888, 9089-9092, 3001-3003)
- [ ] Dépôt Git local existe : `C:\Users\babac\cloud-config-repo\cloud-config-repo-enda`

---

## 🚀 Prêt ? C'est Parti !

1. Ouvrez PowerShell dans ce dossier
2. Exécutez : `.\verify-github-config.ps1`
3. Exécutez : `.\deploy-and-verify.ps1`
4. Exécutez : `.\check-system-status.ps1`
5. Ouvrez http://localhost:8761 dans votre navigateur

**Bon déploiement ! 🎉**
