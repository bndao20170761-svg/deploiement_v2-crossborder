# Configuration des Secrets GitHub pour CI/CD

## 📋 Secrets Requis

Pour que le pipeline CI/CD fonctionne, vous devez configurer les secrets suivants dans votre repository GitHub:

### 1. DOCKERHUB_USERNAME
- **Description**: Votre nom d'utilisateur Docker Hub
- **Exemple**: `votre-username`
- **Où le trouver**: Sur [hub.docker.com](https://hub.docker.com) après connexion

### 2. DOCKERHUB_TOKEN
- **Description**: Token d'accès Docker Hub (plus sécurisé qu'un mot de passe)
- **Comment le créer**:
  1. Connectez-vous sur [hub.docker.com](https://hub.docker.com)
  2. Cliquez sur votre profil → Account Settings
  3. Allez dans Security → New Access Token
  4. Donnez un nom (ex: "GitHub Actions")
  5. Sélectionnez les permissions: Read, Write, Delete
  6. Copiez le token généré (vous ne pourrez plus le voir après)

## 🔧 Comment Ajouter les Secrets

### Via l'Interface GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**
5. Ajoutez chaque secret:
   - Name: `DOCKERHUB_USERNAME`
   - Secret: votre username Docker Hub
   - Cliquez sur **Add secret**
6. Répétez pour `DOCKERHUB_TOKEN`

### Via GitHub CLI (optionnel)

```bash
# Installer GitHub CLI si nécessaire
# https://cli.github.com/

# Se connecter
gh auth login

# Ajouter les secrets
gh secret set DOCKERHUB_USERNAME
# Entrez votre username quand demandé

gh secret set DOCKERHUB_TOKEN
# Entrez votre token quand demandé
```

## 🚀 Vérification

Une fois les secrets configurés:

1. Faites un commit et push sur la branche `main` ou `develop`
2. Allez dans l'onglet **Actions** de votre repository
3. Vous devriez voir le workflow "CI/CD Pipeline - Microservices PVVIH" se lancer
4. Vérifiez que tous les jobs passent au vert ✅

## 📦 Images Docker Hub

Après un déploiement réussi, vos images seront disponibles sur:
- `votre-username/api-register:latest`
- `votre-username/api-configuration:latest`
- `votre-username/gateway-pvvih:latest`
- `votre-username/forum-pvvih:latest`
- `votre-username/gestion-user:latest`
- `votre-username/gestion-reference:latest`
- `votre-username/gestion-patient:latest`
- `votre-username/gestion-forum-front:latest`
- `votre-username/a-reference-front:latest`
- `votre-username/a-user-front:latest`

## 🔄 Déploiement Local depuis Docker Hub

Une fois les images sur Docker Hub, utilisez le script fourni:

```powershell
.\deploy-from-dockerhub.ps1
```

Ou manuellement:

```bash
# Pull toutes les images
docker-compose -f docker-compose.prod.yml pull

# Démarrer les services
docker-compose -f docker-compose.prod.yml up -d
```

## ⚠️ Sécurité

- **Ne commitez JAMAIS** vos tokens ou mots de passe dans le code
- Les secrets GitHub sont chiffrés et sécurisés
- Utilisez toujours des tokens d'accès plutôt que des mots de passe
- Vous pouvez révoquer un token à tout moment sur Docker Hub

## 🆘 Dépannage

### Le workflow échoue avec "unauthorized"
- Vérifiez que `DOCKERHUB_USERNAME` est correct
- Vérifiez que `DOCKERHUB_TOKEN` est valide
- Recréez un nouveau token si nécessaire

### Les images ne sont pas poussées
- Vérifiez les permissions du token (Read, Write, Delete)
- Vérifiez que vous êtes sur la branche `main` ou `develop`

### Le build Maven échoue
- Vérifiez les logs dans l'onglet Actions
- Assurez-vous que tous les `pom.xml` sont corrects
- Les tests peuvent être désactivés temporairement avec `-DskipTests`
