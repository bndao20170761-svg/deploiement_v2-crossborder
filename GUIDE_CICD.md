# Guide CI/CD - Pipeline Automatique

## 🎯 Vue d'ensemble

Ce pipeline CI/CD automatise complètement le déploiement de vos microservices:
- ✅ Build automatique des backends Spring Boot
- ✅ Build automatique des frontends React
- ✅ Tests automatiques
- ✅ Push des images vers Docker Hub
- ✅ Déploiement automatique en production

## 📋 Prérequis

### 1. Compte Docker Hub
- Créez un compte sur [hub.docker.com](https://hub.docker.com) si vous n'en avez pas
- Notez votre username

### 2. Configuration GitHub
- Repository GitHub avec le code source
- Accès aux paramètres du repository (Settings)

## 🚀 Configuration Initiale

### Étape 1: Configurer les Secrets GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** → **Secrets and variables** → **Actions**
3. Ajoutez les secrets suivants:

#### DOCKERHUB_USERNAME
```
Votre username Docker Hub (ex: johndoe)
```

#### DOCKERHUB_TOKEN
Pour créer le token:
1. Connectez-vous sur [hub.docker.com](https://hub.docker.com)
2. Account Settings → Security → New Access Token
3. Nom: "GitHub Actions"
4. Permissions: Read, Write, Delete
5. Copiez le token généré

### Étape 2: Vérifier le Workflow

Le fichier `.github/workflows/deploiement.yml` est déjà configuré et contient:
- Build des 7 microservices backend
- Build des 3 frontends
- Tests automatiques
- Push vers Docker Hub

## 🔄 Utilisation du Pipeline

### Déclenchement Automatique

Le pipeline se déclenche automatiquement sur:
- **Push** sur les branches `main` ou `develop`
- **Pull Request** vers `main` ou `develop`

### Déclenchement Manuel

Vous pouvez aussi déclencher manuellement:
1. Allez dans l'onglet **Actions** de votre repository
2. Sélectionnez "CI/CD Pipeline - Microservices PVVIH"
3. Cliquez sur **Run workflow**
4. Choisissez la branche
5. Cliquez sur **Run workflow**

## 📊 Suivi du Pipeline

### Voir l'Exécution

1. Allez dans l'onglet **Actions**
2. Cliquez sur l'exécution en cours
3. Vous verrez 3 jobs:
   - **build-backends**: Build des 7 microservices (en parallèle)
   - **build-frontends**: Build des 3 frontends (en parallèle)
   - **deploy**: Résumé du déploiement

### Comprendre les Statuts

- 🟡 **Jaune (en cours)**: Le job est en cours d'exécution
- ✅ **Vert (success)**: Le job a réussi
- ❌ **Rouge (failed)**: Le job a échoué

### En cas d'Erreur

Si un job échoue:
1. Cliquez sur le job en rouge
2. Développez l'étape qui a échoué
3. Lisez les logs d'erreur
4. Corrigez le problème dans votre code
5. Commitez et pushez → le pipeline se relance automatiquement

## 🐳 Images Docker Hub

### Après un Build Réussi

Vos images sont disponibles sur Docker Hub:
```
votre-username/api-register:latest
votre-username/api-configuration:latest
votre-username/gateway-pvvih:latest
votre-username/forum-pvvih:latest
votre-username/gestion-user:latest
votre-username/gestion-reference:latest
votre-username/gestion-patient:latest
votre-username/gestion-forum-front:latest
votre-username/a-reference-front:latest
votre-username/a-user-front:latest
```

### Tags Disponibles

Le pipeline crée plusieurs tags:
- `latest`: Dernière version de la branche main
- `main-abc1234`: Version spécifique (SHA du commit)
- `develop`: Dernière version de la branche develop

## 💻 Déploiement Local depuis Docker Hub

### Option 1: Script Automatique (Recommandé)

```powershell
# Première fois: Pull + Démarrer
.\deploy-from-dockerhub.ps1 -Pull -DockerHubUsername votre-username

# Démarrages suivants (sans pull)
.\deploy-from-dockerhub.ps1 -DockerHubUsername votre-username

# Arrêter tous les services
.\deploy-from-dockerhub.ps1 -Stop

# Redémarrer tous les services
.\deploy-from-dockerhub.ps1 -Restart
```

### Option 2: Commandes Manuelles

```bash
# 1. Configurer le username dans .env
echo "DOCKERHUB_USERNAME=votre-username" > .env

# 2. Pull toutes les images
docker-compose -f docker-compose.dockerhub.yml pull

# 3. Démarrer les services
docker-compose -f docker-compose.dockerhub.yml up -d

# 4. Voir les logs
docker-compose -f docker-compose.dockerhub.yml logs -f

# 5. Arrêter
docker-compose -f docker-compose.dockerhub.yml down
```

## 🔧 Workflow Complet de Développement

### 1. Développement Local

```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développer et tester localement
docker-compose up -d

# Commiter les changements
git add .
git commit -m "Ajout de la nouvelle fonctionnalité"
```

### 2. Push et CI/CD

```bash
# Pusher la branche
git push origin feature/nouvelle-fonctionnalite

# Créer une Pull Request sur GitHub
# Le pipeline se lance automatiquement pour tester
```

### 3. Merge et Déploiement

```bash
# Après validation de la PR, merger dans main
# Le pipeline se lance et déploie automatiquement

# Les nouvelles images sont sur Docker Hub
```

### 4. Déploiement en Production

```powershell
# Sur votre serveur de production
.\deploy-from-dockerhub.ps1 -Pull -DockerHubUsername votre-username
```

## 📈 Optimisations

### Build Cache

Le pipeline utilise le cache Docker pour accélérer les builds:
- Les dépendances Maven sont mises en cache
- Les node_modules sont mis en cache
- Les layers Docker sont réutilisés

### Builds Parallèles

- Les 7 backends sont buildés en parallèle
- Les 3 frontends sont buildés en parallèle
- Gain de temps considérable

### Tests Automatiques

- Tests Maven pour les backends
- Tests npm pour les frontends
- Le déploiement n'a lieu que si tous les tests passent

## 🆘 Dépannage

### "unauthorized" lors du push Docker

**Problème**: Les credentials Docker Hub sont incorrects

**Solution**:
1. Vérifiez `DOCKERHUB_USERNAME` dans les secrets GitHub
2. Recréez un nouveau `DOCKERHUB_TOKEN`
3. Vérifiez les permissions du token (Read, Write, Delete)

### Build Maven échoue

**Problème**: Erreur de compilation ou tests qui échouent

**Solution**:
1. Vérifiez les logs dans Actions
2. Testez localement: `mvn clean package`
3. Corrigez les erreurs
4. Commitez et pushez

### Build npm échoue

**Problème**: Erreur de build React

**Solution**:
1. Vérifiez les logs dans Actions
2. Testez localement: `npm run build`
3. Vérifiez les variables d'environnement
4. Corrigez et pushez

### Images non trouvées sur Docker Hub

**Problème**: Le pull échoue

**Solution**:
1. Vérifiez que le pipeline a réussi (onglet Actions)
2. Vérifiez sur hub.docker.com que les images existent
3. Vérifiez le username dans `.env`

## 📚 Ressources

- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Documentation Docker Hub](https://docs.docker.com/docker-hub/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

## 🎓 Bonnes Pratiques

1. **Toujours tester localement** avant de pusher
2. **Utiliser des branches feature** pour le développement
3. **Créer des Pull Requests** pour la revue de code
4. **Merger dans main** uniquement après validation
5. **Surveiller les logs** du pipeline dans Actions
6. **Versionner les images** avec des tags spécifiques pour la production
7. **Sauvegarder les données** avant de redéployer

## 🔐 Sécurité

- ✅ Les secrets sont chiffrés dans GitHub
- ✅ Utilisez des tokens, pas des mots de passe
- ✅ Limitez les permissions des tokens
- ✅ Révoquez les tokens compromis immédiatement
- ✅ Ne commitez JAMAIS de credentials dans le code
