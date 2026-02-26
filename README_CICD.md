# 🚀 CI/CD - Microservices PVVIH

## 🎯 Déploiement Automatique Configuré!

Votre projet dispose maintenant d'un pipeline CI/CD complet qui automatise:
- ✅ Build des microservices Spring Boot
- ✅ Build des frontends React
- ✅ Tests automatiques
- ✅ Push vers Docker Hub
- ✅ Déploiement en une commande

## 📖 Documentation

### 🚀 Démarrage Rapide (5 minutes)
**Lisez en premier**: [`COMMENCER_ICI_CICD.md`](COMMENCER_ICI_CICD.md)

Ce fichier vous guide étape par étape pour:
1. Vérifier votre configuration
2. Créer un compte Docker Hub
3. Configurer les secrets GitHub
4. Lancer votre premier build
5. Déployer localement

### 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| [`COMMENCER_ICI_CICD.md`](COMMENCER_ICI_CICD.md) | **COMMENCEZ ICI** - Point de départ |
| [`DEMARRAGE_RAPIDE_CICD.md`](DEMARRAGE_RAPIDE_CICD.md) | Guide rapide en 5 minutes |
| [`GUIDE_CICD.md`](GUIDE_CICD.md) | Guide complet et détaillé |
| [`CONFIGURATION_GITHUB_SECRETS.md`](CONFIGURATION_GITHUB_SECRETS.md) | Configuration des secrets GitHub |
| [`CICD_RESUME.md`](CICD_RESUME.md) | Résumé complet avec commandes |
| [`FICHIERS_CICD_CREES.md`](FICHIERS_CICD_CREES.md) | Liste de tous les fichiers créés |

## ⚡ Démarrage Ultra-Rapide

### 1. Vérifier la Configuration
```powershell
.\verifier-cicd.ps1
```

### 2. Configurer GitHub
1. Créez un compte sur [hub.docker.com](https://hub.docker.com)
2. Créez un token: Account Settings → Security → New Access Token
3. Ajoutez les secrets dans GitHub:
   - Repository → Settings → Secrets and variables → Actions
   - `DOCKERHUB_USERNAME`: votre username
   - `DOCKERHUB_TOKEN`: le token créé

### 3. Push et Déployer
```bash
# Push le code (déclenche le pipeline)
git push origin main

# Déployer localement depuis Docker Hub
.\deploy-from-dockerhub.ps1 -Pull -DockerHubUsername votre-username
```

## 🌐 URLs d'Accès

Après déploiement:
- **Eureka**: http://localhost:8761
- **Gateway**: http://localhost:8080
- **Forum**: http://localhost:3001
- **Reference**: http://localhost:3002
- **User**: http://localhost:3003

## 🛠️ Scripts Disponibles

| Script | Description | Usage |
|--------|-------------|-------|
| `verifier-cicd.ps1` | Vérifier la configuration | `.\verifier-cicd.ps1` |
| `test-build-local.ps1` | Tester les builds localement | `.\test-build-local.ps1 -All` |
| `deploy-from-dockerhub.ps1` | Déployer depuis Docker Hub | `.\deploy-from-dockerhub.ps1 -Pull` |
| `deploy-dockerhub.bat` | Déploiement simple (Windows) | Double-clic |

## 🔄 Workflow de Développement

```bash
# 1. Créer une branche
git checkout -b feature/ma-fonctionnalite

# 2. Développer et tester
.\test-build-local.ps1 -All

# 3. Commiter et pusher
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin feature/ma-fonctionnalite

# 4. Créer une Pull Request
# Le pipeline teste automatiquement

# 5. Merger dans main
# Le pipeline déploie automatiquement

# 6. Déployer en production
.\deploy-from-dockerhub.ps1 -Pull -DockerHubUsername votre-username
```

## 📦 Services Déployés

### Backends (7 microservices)
- api-register (Eureka) - Port 8761
- api-configuration (Config Server) - Port 8888
- gateway-pvvih (API Gateway) - Port 8080
- forum-pvvih - Port 9092
- gestion-user - Port 9089
- gestion-reference - Port 9090
- gestion-patient - Port 9091

### Frontends (3 applications)
- gestion-forum-front - Port 3001
- a-reference-front - Port 3002
- a-user-front - Port 3003

### Bases de données (4 instances)
- mongodb - Port 27017
- mysql-user - Port 3307
- mysql-reference - Port 3308
- mysql-patient - Port 3309

## ✨ Avantages

- ✅ **Automatique**: Push → Build → Test → Deploy
- ✅ **Rapide**: Builds parallèles avec cache
- ✅ **Fiable**: Tests avant déploiement
- ✅ **Simple**: Un script pour tout déployer
- ✅ **Sécurisé**: Secrets chiffrés dans GitHub

## 🆘 Besoin d'Aide?

1. **Commencez par**: [`COMMENCER_ICI_CICD.md`](COMMENCER_ICI_CICD.md)
2. **Configuration**: [`CONFIGURATION_GITHUB_SECRETS.md`](CONFIGURATION_GITHUB_SECRETS.md)
3. **Dépannage**: [`GUIDE_CICD.md`](GUIDE_CICD.md) section "Dépannage"
4. **Référence**: [`CICD_RESUME.md`](CICD_RESUME.md)

## 🎓 Ressources

- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Hub](https://docs.docker.com/docker-hub/)
- [Docker Compose](https://docs.docker.com/compose/)

---

**🚀 Prêt à déployer? Commencez par [`COMMENCER_ICI_CICD.md`](COMMENCER_ICI_CICD.md)!**
