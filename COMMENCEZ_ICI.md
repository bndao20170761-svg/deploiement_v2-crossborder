# 👋 COMMENCEZ ICI - Déploiement AWS EC2

## 🎯 Vous êtes ici

Vous êtes connecté à votre instance AWS EC2:
- **Utilisateur:** `ubuntu@ip-172-31-38-60`
- **IP Publique:** `16.171.1.67`
- **Prérequis:** ✅ Docker, Docker Compose, Git installés
- **Security Group:** ✅ Ports 8080, 3001-3003, 8761 ouverts

---

## 📚 Documentation Disponible

Voici tous les fichiers de documentation créés pour vous:

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **RESUME_DEPLOIEMENT_AWS.txt** | Résumé visuel rapide | Pour avoir une vue d'ensemble |
| **DEMARRAGE_RAPIDE_AWS.md** | Guide rapide (5 commandes) | Pour déployer rapidement |
| **README_AWS_DEPLOIEMENT.md** | Documentation complète | Pour comprendre l'architecture |
| **DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md** | Guide détaillé | Pour un déploiement pas à pas |
| **COMMANDES_AWS_DEPLOIEMENT.sh** | Script interactif | Pour suivre les étapes interactivement |
| **TRANSFERT_FICHIERS_AWS.md** | Guide de transfert | Si vous devez transférer des fichiers |

---

## 🚀 Démarrage Rapide (3 étapes)

### Étape 1: Cloner le projet

```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO
```

**⚠️ Remplacez `VOTRE_USERNAME/VOTRE_REPO` par votre vrai repository GitHub!**

---

### Étape 2: Configurer l'environnement

```bash
# Copier le template
cp .env.aws.example .env

# Éditer le fichier
nano .env
```

**Dans nano, modifiez ces valeurs:**

```bash
MONGO_PASSWORD=VotreMotDePasseMongo123!
MYSQL_ROOT_PASSWORD=VotreMotDePasseRoot123!
MYSQL_USER_PASSWORD=VotreMotDePasseUser123!
MYSQL_REFERENCE_PASSWORD=VotreMotDePasseReference123!
MYSQL_PATIENT_PASSWORD=VotreMotDePassePatient123!
JWT_SECRET=VotreCleSecreteTresLongueEtSecurisee123456789ABCDEFGHIJKLMNOP
```

**Sauvegardez:** `Ctrl+X` → `Y` → `Enter`

---

### Étape 3: Déployer

```bash
# Rendre le script exécutable
chmod +x deploy-aws-simple.sh

# Lancer le déploiement
bash deploy-aws-simple.sh
```

**⏱️ Temps estimé: 10-20 minutes**

---

## 🌐 Accès à votre Application

Une fois le déploiement terminé, ouvrez votre navigateur:

```
Gateway API:        http://16.171.1.67:8080
Eureka Dashboard:   http://16.171.1.67:8761
Frontend Forum:     http://16.171.1.67:3001
Frontend Reference: http://16.171.1.67:3002
Frontend User:      http://16.171.1.67:3003
```

---

## 🧪 Test Rapide

### Créer un utilisateur

```bash
curl -X POST http://16.171.1.67:8080/api/user-auth/register \
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
```

### Se connecter

```bash
curl -X POST http://16.171.1.67:8080/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@test.com",
    "password": "admin123"
  }'
```

---

## 📊 Commandes Utiles

```bash
# Voir l'état des services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Voir les ressources
docker stats

# Redémarrer un service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart SERVICE_NAME
```

---

## 🎓 Guides Détaillés

### Pour un déploiement rapide (5 minutes)
👉 Lisez: **DEMARRAGE_RAPIDE_AWS.md**

```bash
cat DEMARRAGE_RAPIDE_AWS.md
# ou
less DEMARRAGE_RAPIDE_AWS.md
```

### Pour comprendre chaque étape en détail
👉 Lisez: **DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md**

```bash
cat DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md
# ou
less DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md
```

### Pour une vue d'ensemble complète
👉 Lisez: **README_AWS_DEPLOIEMENT.md**

```bash
cat README_AWS_DEPLOIEMENT.md
# ou
less README_AWS_DEPLOIEMENT.md
```

### Pour un résumé visuel rapide
👉 Lisez: **RESUME_DEPLOIEMENT_AWS.txt**

```bash
cat RESUME_DEPLOIEMENT_AWS.txt
```

### Pour suivre les étapes interactivement
👉 Exécutez: **COMMANDES_AWS_DEPLOIEMENT.sh**

```bash
chmod +x COMMANDES_AWS_DEPLOIEMENT.sh
bash COMMANDES_AWS_DEPLOIEMENT.sh
```

---

## 🔧 Scripts Disponibles

| Script | Description | Commande |
|--------|-------------|----------|
| **deploy-aws-simple.sh** | Déploiement automatisé | `bash deploy-aws-simple.sh` |
| **COMMANDES_AWS_DEPLOIEMENT.sh** | Guide interactif | `bash COMMANDES_AWS_DEPLOIEMENT.sh` |

---

## 🆘 Besoin d'Aide?

### Problème de déploiement
1. Vérifiez les logs: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f`
2. Vérifiez l'état: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps`
3. Consultez: **DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md** (section Dépannage)

### Problème de configuration
1. Vérifiez le fichier `.env`: `cat .env`
2. Consultez: **.env.aws.example** pour voir les valeurs attendues
3. Assurez-vous que JWT_SECRET est identique partout

### Problème de connexion
1. Vérifiez le Security Group AWS (ports ouverts)
2. Vérifiez que les services sont "healthy"
3. Testez localement: `curl http://localhost:8080/actuator/health`

---

## 📋 Checklist

Avant de commencer:
- [ ] Vous êtes connecté à l'instance EC2
- [ ] Docker et Docker Compose sont installés
- [ ] Le Security Group est configuré
- [ ] Vous avez l'URL de votre repository GitHub

Pendant le déploiement:
- [ ] Repository cloné
- [ ] Fichier `.env` créé et configuré
- [ ] Mots de passe sécurisés définis
- [ ] JWT_SECRET configuré
- [ ] Script de déploiement lancé

Après le déploiement:
- [ ] Tous les services sont "healthy"
- [ ] Test d'API réussi (register/login)
- [ ] Frontends accessibles depuis le navigateur
- [ ] Eureka Dashboard affiche tous les services

---

## 🎯 Prochaines Étapes

1. **Maintenant:** Suivez le guide de démarrage rapide
2. **Ensuite:** Testez votre application
3. **Plus tard:** Configurez un nom de domaine et HTTPS
4. **Optionnel:** Mettez en place des sauvegardes et du monitoring

---

## 💡 Conseils

- **Première fois?** Suivez **DEMARRAGE_RAPIDE_AWS.md**
- **Besoin de détails?** Consultez **DEPLOIEMENT_AWS_ETAPE_PAR_ETAPE.md**
- **Problème?** Vérifiez les logs et consultez la section Dépannage
- **Mise à jour?** Utilisez `git pull` puis redéployez

---

**Bon déploiement! 🚀**

Pour commencer, exécutez:
```bash
cat DEMARRAGE_RAPIDE_AWS.md
```

Ou lancez directement le déploiement:
```bash
bash deploy-aws-simple.sh
```
