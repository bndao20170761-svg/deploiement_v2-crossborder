# ✅ Mise à Jour Complète - Nouvelle IP GCP

## 🎯 Nouvelle IP: `34.32.116.206`

**Date de mise à jour:** 10 Mars 2026  
**Ancienne IP:** 34.133.155.230  
**Nouvelle IP:** 34.32.116.206

---

## 📝 Fichiers Mis à Jour

### ✅ Fichiers de Configuration Principaux

1. **`.env`** - Configuration principale
   - ✅ PUBLIC_IP=34.32.116.206
   - ✅ PUBLIC_URL=http://34.32.116.206:8080
   - ✅ FORUM_URL=http://34.32.116.206:3001
   - ✅ FRONTEND1_URL=http://34.32.116.206:3002
   - ✅ FRONTEND2_URL=http://34.32.116.206:3003
   - ✅ CORS_ALLOWED_ORIGINS mis à jour

2. **`.env.gcp.example`** - Template GCP
   - ✅ Toutes les URLs mises à jour avec la nouvelle IP

### ✅ Frontends

3. **`gestion_forum_front/.env`**
   - ✅ REACT_APP_API_URL=http://34.32.116.206:8080/api
   - ✅ REACT_APP_FORUM_API_URL=http://34.32.116.206:8080/api
   - ✅ REACT_APP_AUTH_API_URL=http://34.32.116.206:8080/api
   - ✅ REACT_APP_GATEWAY_URL=http://34.32.116.206:8080
   - ✅ REACT_APP_FRONTEND1_URL=http://34.32.116.206:3002
   - ✅ REACT_APP_FRONTEND2_URL=http://34.32.116.206:3003

4. **`a_reference_front/.env`**
   - ✅ REACT_APP_GATEWAY_URL=http://34.32.116.206:8080
   - ✅ REACT_APP_USER_API_URL=http://34.32.116.206:8080/api
   - ✅ REACT_APP_REFERENCEMENT_API_URL=http://34.32.116.206:8080/api
   - ✅ REACT_APP_PATIENT_API_URL=http://34.32.116.206:8080/api
   - ✅ REACT_APP_FORUM_API_URL=http://34.32.116.206:8080/api
   - ✅ REACT_APP_FORUM_URL=http://34.32.116.206:3001
   - ✅ REACT_APP_FRONTEND2_URL=http://34.32.116.206:3003

5. **`a_user_front/.env`**
   - ✅ REACT_APP_GATEWAY_URL=http://34.32.116.206:8080
   - ✅ REACT_APP_USER_API_URL=http://34.32.116.206:8080/api
   - ✅ REACT_APP_FORUM_URL=http://34.32.116.206:3001
   - ✅ REACT_APP_FRONTEND2_URL=http://34.32.116.206:3003

### ✅ Scripts de Déploiement

6. **`setup-nouvelle-instance-gcp.sh`**
   - ✅ Exemple mis à jour avec la nouvelle IP

7. **`deploy-gcp-complet.sh`**
   - ✅ Utilise automatiquement l'IP du fichier .env

### ✅ Documentation

8. **`DEPLOIEMENT_GCP_GUIDE.md`**
   - ✅ IP externe mise à jour: 34.32.116.206
   - ✅ Toutes les URLs d'exemple mises à jour
   - ✅ Commandes curl mises à jour

9. **`NOUVELLE_INSTANCE_GCP.md`**
   - ✅ Exemples mis à jour avec la nouvelle IP

---

## 🌐 URLs d'Accès Mises à Jour

| Service | URL |
|---------|-----|
| Gateway API | http://34.32.116.206:8080 |
| Eureka Dashboard | http://34.32.116.206:8761 |
| Frontend Forum | http://34.32.116.206:3001 |
| Frontend Reference | http://34.32.116.206:3002 |
| Frontend User | http://34.32.116.206:3003 |

---

## 🔧 Configuration CORS Mise à Jour

```env
CORS_ALLOWED_ORIGINS=http://34.32.116.206:3000,http://34.32.116.206:3001,http://34.32.116.206:3002,http://34.32.116.206:3003,http://34.32.116.206:8080
```

---

## 🚀 Prochaines Étapes

### 1. Configurer les Règles de Pare-feu GCP

```bash
gcloud compute firewall-rules create allow-pvvih-app-ports \
  --allow tcp:8080,tcp:8761,tcp:3001,tcp:3002,tcp:3003 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow PVVIH application ports"
```

Ou via la console GCP:
- Allez dans **VPC Network** > **Firewall**
- Créez une règle pour les ports: 8080, 8761, 3001, 3002, 3003

### 2. Se Connecter à l'Instance GCP

```bash
gcloud compute ssh VOTRE_INSTANCE --zone=VOTRE_ZONE
```

### 3. Cloner le Repository

```bash
git clone https://github.com/VOTRE_USERNAME/deploiement_v2-crossborder.git
cd deploiement_v2-crossborder
```

### 4. Exécuter le Script de Configuration

```bash
bash setup-nouvelle-instance-gcp.sh 34.32.116.206
```

### 5. Se Déconnecter et Reconnecter

```bash
exit
# Puis reconnectez-vous via SSH
```

### 6. Lancer le Déploiement

```bash
cd deploiement_v2-crossborder
bash deploy-gcp-complet.sh
```

---

## 🧪 Tests à Effectuer Après Déploiement

### Test 1: Vérifier les Services

```bash
# Sur l'instance GCP
docker-compose ps
```

Tous les services doivent être "Up" et "healthy".

### Test 2: Health Checks

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

### Test 3: Accès Externe

Ouvrez dans votre navigateur:

```
http://34.32.116.206:8080      # Gateway API
http://34.32.116.206:8761      # Eureka Dashboard
http://34.32.116.206:3001      # Frontend Forum
http://34.32.116.206:3002      # Frontend Reference
http://34.32.116.206:3003      # Frontend User
```

### Test 4: API d'Authentification

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

---

## 📋 Checklist de Vérification

- [x] Fichier `.env` mis à jour
- [x] Fichier `.env.gcp.example` mis à jour
- [x] Frontend Forum `.env` mis à jour
- [x] Frontend Reference `.env` mis à jour
- [x] Frontend User `.env` mis à jour
- [x] Scripts de déploiement mis à jour
- [x] Documentation mise à jour
- [ ] Règles de pare-feu GCP configurées
- [ ] Instance GCP accessible via SSH
- [ ] Repository cloné sur l'instance
- [ ] Docker installé et configuré
- [ ] Déploiement lancé
- [ ] Tous les services démarrés
- [ ] Health checks réussis
- [ ] Frontends accessibles
- [ ] API testée avec succès

---

## 🔒 Sécurité

N'oubliez pas de:

1. ✅ Changer les mots de passe dans `.env`:
   - MONGO_PASSWORD
   - MYSQL_ROOT_PASSWORD
   - MYSQL_USER_PASSWORD
   - MYSQL_REFERENCE_PASSWORD
   - MYSQL_PATIENT_PASSWORD

2. ✅ Ne JAMAIS changer JWT_SECRET (doit rester identique)

3. ✅ Configurer les règles de pare-feu GCP correctement

4. ✅ Sauvegarder le fichier `.env` en lieu sûr

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs: `docker-compose logs -f`
2. Vérifiez l'état: `docker-compose ps`
3. Consultez: `DEPLOIEMENT_GCP_GUIDE.md`
4. Consultez: `NOUVELLE_INSTANCE_GCP.md`

---

**Tous les fichiers sont maintenant configurés avec la nouvelle IP: 34.32.116.206** ✅

**Prêt pour le déploiement!** 🚀
