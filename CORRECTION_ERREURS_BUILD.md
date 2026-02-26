# 🔧 Correction des Erreurs de Build

## ❌ Erreurs Rencontrées

Deux services échouent sur GitHub Actions:
1. **forum-pvvih** (Backend) - Exit code 1
2. **a-user-front** (Frontend) - Exit code 1

Cela annule tous les autres builds.

## 🔍 Diagnostic

### Étape 1: Tester Localement

Lancez ce script pour voir les vraies erreurs:

```powershell
.\test-problematic-services.ps1
```

Ce script va:
- ✅ Tester le build Maven de Forum_PVVIH
- ✅ Tester le build npm de a_user_front
- ✅ Afficher les erreurs détaillées

### Étape 2: Analyser les Erreurs

Les erreurs courantes sont:

#### Pour Forum_PVVIH (Backend Maven)

**Erreur possible 1: Dépendances manquantes**
```
[ERROR] Failed to execute goal on project: Could not resolve dependencies
```
**Solution**:
```powershell
cd Forum_PVVIH
mvn dependency:purge-local-repository
mvn clean install
```

**Erreur possible 2: Version Java incorrecte**
```
[ERROR] Source option 17 is no longer supported
```
**Solution**: Vérifiez que Java 17 est installé
```powershell
java -version
# Devrait afficher: openjdk version "17.x.x"
```

**Erreur possible 3: Tests qui échouent**
```
[ERROR] Tests run: X, Failures: Y
```
**Solution**: Désactivez les tests temporairement
```xml
<!-- Dans pom.xml, ajoutez: -->
<properties>
    <maven.test.skip>true</maven.test.skip>
</properties>
```

#### Pour a_user_front (Frontend npm)

**Erreur possible 1: Dépendances manquantes**
```
npm ERR! missing: react@^18.0.0
```
**Solution**:
```powershell
cd a_user_front
rm -rf node_modules package-lock.json
npm install
```

**Erreur possible 2: Erreurs de compilation**
```
Failed to compile
Module not found: Can't resolve 'xxx'
```
**Solution**: Vérifiez les imports dans le code

**Erreur possible 3: Mémoire insuffisante**
```
FATAL ERROR: Reached heap limit
```
**Solution**: Augmentez la mémoire Node
```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

**Erreur possible 4: Variables d'environnement manquantes**
```
Error: REACT_APP_XXX is not defined
```
**Solution**: Créez un fichier `.env` dans a_user_front
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GATEWAY_URL=http://localhost:8080
```

## 🛠️ Corrections Rapides

### Pour Forum_PVVIH

```powershell
# 1. Nettoyer et rebuilder
cd Forum_PVVIH
mvn clean
mvn package -DskipTests

# 2. Si ça échoue, vérifier le pom.xml
# Assurez-vous que la version Java est correcte
```

### Pour a_user_front

```powershell
# 1. Nettoyer et rebuilder
cd a_user_front
rm -rf node_modules build
npm install
npm run build

# 2. Si problème de mémoire
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 3. Vérifier le fichier .env
# Copiez env.example vers .env si nécessaire
cp env.example .env
```

## 📋 Checklist de Vérification

### Forum_PVVIH
- [ ] Java 17 installé
- [ ] Maven installé
- [ ] pom.xml valide
- [ ] Dépendances téléchargeables
- [ ] Tests passent (ou désactivés)
- [ ] Build local réussit

### a_user_front
- [ ] Node.js 18+ installé
- [ ] package.json valide
- [ ] node_modules installé
- [ ] Fichier .env présent
- [ ] Build local réussit
- [ ] Dossier build créé

## 🔄 Workflow de Correction

```powershell
# 1. Tester localement
.\test-problematic-services.ps1

# 2. Corriger les erreurs identifiées

# 3. Retester
.\test-problematic-services.ps1

# 4. Une fois que tout passe, commiter
git add .
git commit -m "Fix: Correction des erreurs de build"
git push origin main

# 5. Vérifier GitHub Actions
# Allez dans l'onglet Actions pour voir si ça passe
```

## 🚀 Solution Alternative

Si les erreurs persistent et que vous voulez déployer rapidement:

### Option 1: Exclure les Services Problématiques

Modifiez `.github/workflows/deploiement.yml` pour exclure temporairement ces services:

```yaml
# Commentez forum-pvvih et a-user-front dans la matrice
```

### Option 2: Build Local

Utilisez le build local au lieu de GitHub Actions:

```powershell
# Builder et pusher vers Docker Hub
.\build-and-push-all.ps1 -DockerHubUsername votre-username

# Déployer
.\deploy-from-dockerhub.ps1 -Pull -DockerHubUsername votre-username
```

## 📊 Logs Détaillés

### Voir les Logs GitHub Actions

1. Allez sur GitHub → Onglet Actions
2. Cliquez sur l'exécution échouée
3. Cliquez sur le job en rouge (forum-pvvih ou a-user-front)
4. Développez les étapes pour voir les erreurs

### Logs Locaux

```powershell
# Maven (Forum_PVVIH)
cd Forum_PVVIH
mvn clean package -X > build.log 2>&1
# Ouvrez build.log pour voir les détails

# npm (a_user_front)
cd a_user_front
npm run build > build.log 2>&1
# Ouvrez build.log pour voir les détails
```

## 🆘 Si Rien ne Fonctionne

1. **Vérifiez les versions**:
   ```powershell
   java -version    # Devrait être 17
   mvn -version     # Devrait être 3.8+
   node -version    # Devrait être 18+
   npm -version     # Devrait être 9+
   ```

2. **Nettoyez tout**:
   ```powershell
   # Forum_PVVIH
   cd Forum_PVVIH
   mvn clean
   rm -rf target
   
   # a_user_front
   cd a_user_front
   rm -rf node_modules build
   ```

3. **Rebuilder from scratch**:
   ```powershell
   # Forum_PVVIH
   cd Forum_PVVIH
   mvn clean install -DskipTests
   
   # a_user_front
   cd a_user_front
   npm install
   npm run build
   ```

4. **Utilisez le build local**:
   ```powershell
   .\build-and-push-all.ps1 -DockerHubUsername votre-username
   ```

## 📚 Ressources

- [Maven Troubleshooting](https://maven.apache.org/guides/mini/guide-troubleshooting.html)
- [React Build Errors](https://create-react-app.dev/docs/troubleshooting/)
- [Node.js Memory Issues](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-megabytes)

---

**Commencez par**: `.\test-problematic-services.ps1`
