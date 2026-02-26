# 🚀 Démarrage Rapide - CI/CD

## En 5 Minutes

### 1️⃣ Créer un Compte Docker Hub (si nécessaire)
👉 [hub.docker.com](https://hub.docker.com)

### 2️⃣ Créer un Token Docker Hub

1. Connectez-vous sur Docker Hub
2. Account Settings → Security → **New Access Token**
3. Nom: `GitHub Actions`
4. Permissions: **Read, Write, Delete**
5. **Copiez le token** (vous ne pourrez plus le voir!)

### 3️⃣ Configurer les Secrets GitHub

1. Allez sur votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**

Ajoutez ces 2 secrets:

| Nom | Valeur |
|-----|--------|
| `DOCKERHUB_USERNAME` | Votre username Docker Hub |
| `DOCKERHUB_TOKEN` | Le token que vous venez de créer |

### 4️⃣ Push votre Code

```bash
git add .
git commit -m "Configuration CI/CD"
git push origin main
```

### 5️⃣ Vérifier le Pipeline

1. Allez dans l'onglet **Actions** de votre repository
2. Vous devriez voir le workflow en cours d'exécution
3. Attendez que tout soit vert ✅

## 🎉 C'est Fait!

Vos images sont maintenant sur Docker Hub!

## 📦 Déployer Localement

```powershell
# Télécharger et démarrer tous les services
.\deploy-from-dockerhub.ps1 -Pull -DockerHubUsername votre-username
```

## 🌐 Accéder aux Applications

- **Eureka**: http://localhost:8761
- **Gateway**: http://localhost:8080
- **Forum**: http://localhost:3001
- **Reference**: http://localhost:3002
- **User**: http://localhost:3003

## 📖 Documentation Complète

Pour plus de détails, consultez:
- `GUIDE_CICD.md` - Guide complet du pipeline
- `CONFIGURATION_GITHUB_SECRETS.md` - Configuration détaillée des secrets

## 🆘 Besoin d'Aide?

### Le pipeline échoue?
1. Cliquez sur le job en rouge dans Actions
2. Lisez les logs d'erreur
3. Consultez `GUIDE_CICD.md` section "Dépannage"

### Les images ne sont pas sur Docker Hub?
1. Vérifiez que le pipeline est vert ✅
2. Vérifiez vos secrets GitHub
3. Vérifiez les permissions du token

## 🔄 Workflow Quotidien

```bash
# 1. Développer
git checkout -b feature/ma-fonctionnalite
# ... coder ...

# 2. Commiter et pusher
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin feature/ma-fonctionnalite

# 3. Créer une Pull Request sur GitHub
# Le pipeline teste automatiquement

# 4. Merger dans main
# Le pipeline déploie automatiquement sur Docker Hub

# 5. Déployer en production
.\deploy-from-dockerhub.ps1 -Pull -DockerHubUsername votre-username
```

## ✨ Avantages

- ✅ **Automatique**: Push → Build → Test → Deploy
- ✅ **Rapide**: Builds parallèles
- ✅ **Fiable**: Tests automatiques
- ✅ **Simple**: Un seul script pour déployer
- ✅ **Sécurisé**: Secrets chiffrés

## 🎯 Prochaines Étapes

1. ✅ Configurer les secrets GitHub
2. ✅ Faire un premier push
3. ✅ Vérifier que le pipeline passe
4. ✅ Déployer localement depuis Docker Hub
5. 🚀 Profiter du CI/CD automatique!
