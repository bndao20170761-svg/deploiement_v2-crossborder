# 🚀 COMMENCEZ ICI - Nouvelle IP GCP

## ✅ Votre Nouvelle IP: `34.32.116.206`

**Tous les fichiers ont été mis à jour avec votre nouvelle IP!**

---

## 📋 Ce qui a été fait

✅ **9 fichiers de configuration** mis à jour avec la nouvelle IP  
✅ **3 frontends** configurés pour pointer vers la nouvelle IP  
✅ **Scripts de déploiement** prêts à l'emploi  
✅ **Documentation complète** créée  

---

## 🎯 Vos 3 Prochaines Actions

### 1️⃣ Pousser sur GitHub

```powershell
# Exécutez ce script PowerShell
.\push-nouvelle-ip-gcp.ps1
```

Ou manuellement:
```bash
git add .
git commit -m "🔄 Mise à jour IP GCP: 34.32.116.206"
git push origin main
```

### 2️⃣ Configurer le Pare-feu GCP

Via la console GCP:
- Allez dans **VPC Network** > **Firewall**
- Créez une règle nommée `allow-pvvih-app-ports`
- Autorisez les ports: **8080, 8761, 3001, 3002, 3003**
- Source: `0.0.0.0/0`

Ou via gcloud CLI:
```bash
gcloud compute firewall-rules create allow-pvvih-app-ports \
  --allow tcp:8080,tcp:8761,tcp:3001,tcp:3002,tcp:3003 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow PVVIH application ports"
```

### 3️⃣ Déployer sur GCP

```bash
# 1. Connectez-vous à votre instance
gcloud compute ssh VOTRE_INSTANCE --zone=VOTRE_ZONE

# 2. Clonez le repository
git clone https://github.com/VOTRE_USERNAME/deploiement_v2-crossborder.git
cd deploiement_v2-crossborder

# 3. Configurez l'instance
bash setup-nouvelle-instance-gcp.sh 34.32.116.206

# 4. Déconnectez-vous et reconnectez-vous
exit
# Puis reconnectez-vous

# 5. Lancez le déploiement
cd deploiement_v2-crossborder
bash deploy-gcp-complet.sh
```

---

## 🌐 Vos URLs d'Accès

Une fois le déploiement terminé, accédez à:

| Service | URL |
|---------|-----|
| 🌐 Gateway API | http://34.32.116.206:8080 |
| 📊 Eureka Dashboard | http://34.32.116.206:8761 |
| 💬 Frontend Forum | http://34.32.116.206:3001 |
| 🏥 Frontend Reference | http://34.32.116.206:3002 |
| 👤 Frontend User | http://34.32.116.206:3003 |

---

## 📚 Documentation Disponible

| Fichier | Description |
|---------|-------------|
| **NOUVELLE_IP_GCP_34.32.116.206.md** | 📋 Récapitulatif complet avec checklist |
| **NOUVELLE_INSTANCE_GCP.md** | 🎓 Guide pas à pas pour nouvelle instance |
| **DEPLOIEMENT_GCP_GUIDE.md** | 📖 Guide détaillé de déploiement |
| **RESUME_CHANGEMENTS_IP.md** | 📊 Résumé visuel des changements |
| **push-nouvelle-ip-gcp.ps1** | 🚀 Script pour pousser sur GitHub |

---

## 🔍 Fichiers Modifiés

### Configuration Backend
- ✅ `.env` - Configuration principale
- ✅ `.env.gcp.example` - Template GCP

### Frontends
- ✅ `gestion_forum_front/.env`
- ✅ `a_reference_front/.env`
- ✅ `a_user_front/.env`

### Scripts
- ✅ `setup-nouvelle-instance-gcp.sh`
- ✅ `deploy-gcp-complet.sh`

### Documentation
- ✅ `DEPLOIEMENT_GCP_GUIDE.md`
- ✅ `NOUVELLE_INSTANCE_GCP.md`

---

## ⏱️ Temps Estimé

| Étape | Durée |
|-------|-------|
| Push sur GitHub | 2 min |
| Configuration pare-feu GCP | 3 min |
| Configuration instance | 10 min |
| Déploiement complet | 50-60 min |
| **TOTAL** | **~70 min** |

---

## 🧪 Tests Après Déploiement

### 1. Vérifier les Services

```bash
docker-compose ps
```

Tous doivent être "Up" et "healthy".

### 2. Tester l'API

```bash
# Créer un utilisateur
curl -X POST http://34.32.116.206:8080/api/user-auth/register \
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
curl -X POST http://34.32.116.206:8080/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@test.com",
    "password": "admin123"
  }'
```

### 3. Tester les Frontends

Ouvrez dans votre navigateur:
- http://34.32.116.206:3001 (Forum)
- http://34.32.116.206:3002 (Reference)
- http://34.32.116.206:3003 (User)

---

## 🔒 Sécurité

### ⚠️ Important

Avant de déployer en production, changez ces mots de passe dans `.env`:

```env
MONGO_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_ROOT_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_USER_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_REFERENCE_PASSWORD=VotreMotDePasseSecurise123!
MYSQL_PATIENT_PASSWORD=VotreMotDePasseSecurise123!
```

### ✅ Ne PAS Modifier

```env
JWT_SECRET=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
```

Cette clé doit rester identique pour tous les services!

---

## 📞 Besoin d'Aide?

### Commandes Utiles

```bash
# Voir l'état des services
docker-compose ps

# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart SERVICE_NAME

# Arrêter tout
docker-compose down

# Voir l'utilisation des ressources
docker stats
```

### Documentation

1. Consultez **NOUVELLE_IP_GCP_34.32.116.206.md** pour le récapitulatif complet
2. Consultez **NOUVELLE_INSTANCE_GCP.md** pour le guide pas à pas
3. Consultez **DEPLOIEMENT_GCP_GUIDE.md** pour les détails techniques

---

## ✅ Checklist Rapide

- [ ] Pousser les changements sur GitHub
- [ ] Configurer les règles de pare-feu GCP
- [ ] Se connecter à l'instance GCP
- [ ] Cloner le repository
- [ ] Exécuter le script de configuration
- [ ] Se déconnecter et reconnecter
- [ ] Lancer le déploiement
- [ ] Vérifier que tous les services sont "Up"
- [ ] Tester les URLs dans le navigateur
- [ ] Tester l'API (register/login)
- [ ] Changer les mots de passe en production

---

## 🎉 C'est Parti!

**Tout est prêt pour le déploiement!**

Commencez par exécuter:
```powershell
.\push-nouvelle-ip-gcp.ps1
```

Puis suivez les instructions affichées.

**Bonne chance! 🚀**
