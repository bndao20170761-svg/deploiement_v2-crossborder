# 🚀 Démarrage Rapide - Build Local

## ⚡ En 3 Étapes (30 minutes)

### Étape 1: Préparer Docker Hub 🐳

1. Créez un compte sur **https://hub.docker.com** (si nécessaire)
2. Notez votre username

### Étape 2: Builder et Pusher 🔨

**Option A: Script PowerShell (Recommandé)**
```powershell
.\build-and-push-all.ps1 -DockerHubUsername votre-username
```

**Option B: Script Batch (Double-clic)**
Double-cliquez sur `build-and-push.bat` et suivez les instructions

Le script va:
- ✅ Se connecter à Docker Hub (vous demandera votre mot de passe)
- ✅ Builder les 7 backends (Maven)
- ✅ Builder les 3 frontends (npm)
- ✅ Créer les images Docker
- ✅ Pusher vers Docker Hub

⏱️ **Temps estimé**: 20-30 minutes

### Étape 3: Déployer 🚀

```powershell
.\deploy-from-dockerhub.ps1 -Pull -DockerHubUsername votre-username
```

## 🎉 C'est Tout!

Vos services sont maintenant déployés:
- **Eureka**: http://localhost:8761
- **Gateway**: http://localhost:8080
- **Forum**: http://localhost:3001
- **Reference**: http://localhost:3002
- **User**: http://localhost:3003

## 🔄 Workflow Quotidien

```powershell
# 1. Modifier le code
# ... développer ...

# 2. Builder et pusher
.\build-and-push-all.ps1 -DockerHubUsername votre-username -SkipTests

# 3. Redéployer
.\deploy-from-dockerhub.ps1 -Restart
```

## ⚡ Options Rapides

### Build Rapide (sans tests)
```powershell
.\build-and-push-all.ps1 -DockerHubUsername votre-username -SkipTests
```

### Build Uniquement Backends
```powershell
.\build-and-push-all.ps1 -DockerHubUsername votre-username -BackendsOnly
```

### Build Uniquement Frontends
```powershell
.\build-and-push-all.ps1 -DockerHubUsername votre-username -FrontendsOnly
```

## 🆘 Problèmes?

### Docker ne démarre pas?
```powershell
# Redémarrer Docker Desktop
# Puis réessayer
```

### Build échoue?
```powershell
# Vérifier les logs
# Tester un service individuellement
cd gestion_reference
mvn clean package
```

### Connexion Docker Hub échoue?
```powershell
# Se connecter manuellement
docker login -u votre-username
```

## 📚 Documentation Complète

Pour plus de détails: `SOLUTION_SANS_GITHUB_ACTIONS.md`

---

**Prêt? Lancez:**
```powershell
.\build-and-push-all.ps1 -DockerHubUsername votre-username
```
