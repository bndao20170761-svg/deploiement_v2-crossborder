# Commandes pour Renommer les Fichiers de Configuration

## Convention de Nommage Spring Cloud Config

```
{application-name}-{profile}.yml
```

**Exemples:**
- `User_API_PVVIH-dev.yml` ✅
- `GETWAY_PVVIH-dev.yml` ✅
- `application_getway.yaml` ❌

---

## Option 1: Script Automatique (Recommandé)

### Exécuter le script PowerShell

```powershell
# Depuis le répertoire racine de votre projet
.\rename-config-files.ps1
```

Le script va:
1. Cloner ou mettre à jour le dépôt
2. Renommer automatiquement tous les fichiers
3. Commit et push vers GitHub

---

## Option 2: Commandes Manuelles

### Étape 1: Accéder au dépôt

```powershell
# Si le dépôt n'existe pas localement, le cloner
git clone https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
cd cloud-config-repo-enda

# Si le dépôt existe déjà, le mettre à jour
cd cloud-config-repo-enda
git pull origin main
```

### Étape 2: Lister les fichiers actuels

```powershell
# Voir tous les fichiers YAML
dir *.yml
dir *.yaml

# Ou avec Git
git ls-files
```

### Étape 3: Renommer les fichiers

**Important:** Utilisez `git mv` au lieu de `mv` ou `ren` pour que Git suive le renommage.

#### Gateway

```powershell
# Si le fichier s'appelle application_getway.yaml
git mv application_getway.yaml GETWAY_PVVIH-dev.yml

# Ou si c'est un autre nom
git mv gateway.yaml GETWAY_PVVIH-dev.yml
git mv getway.yml GETWAY_PVVIH-dev.yml
```

#### User Service

```powershell
# Renommer selon le nom actuel
git mv user.yaml User_API_PVVIH-dev.yml
# OU
git mv gestion_user.yml User_API_PVVIH-dev.yml
# OU
git mv user-api.yaml User_API_PVVIH-dev.yml
```

#### Patient Service

```powershell
# Renommer selon le nom actuel
git mv patient.yaml Patient_API_PVVIH-dev.yml
# OU
git mv gestion_patient.yml Patient_API_PVVIH-dev.yml
# OU
git mv patient-api.yaml Patient_API_PVVIH-dev.yml
```

#### Reference Service

```powershell
# Renommer selon le nom actuel
git mv reference.yaml referencement_PVVIH-dev.yml
# OU
git mv gestion_reference.yml referencement_PVVIH-dev.yml
# OU
git mv referencement.yaml referencement_PVVIH-dev.yml
```

#### Forum Service

```powershell
# Renommer selon le nom actuel
git mv forum.yaml Forum_PVVIH-dev.yml
# OU
git mv forum-pvvih.yml Forum_PVVIH-dev.yml
```

### Étape 4: Vérifier les changements

```powershell
# Voir les fichiers renommés
git status

# Lister les nouveaux noms
dir *.yml
```

### Étape 5: Commit et Push

```powershell
# Ajouter tous les changements
git add .

# Créer le commit
git commit -m "Rename config files to follow Spring Cloud Config naming convention

- Gateway: GETWAY_PVVIH-dev.yml
- User Service: User_API_PVVIH-dev.yml
- Patient Service: Patient_API_PVVIH-dev.yml
- Reference Service: referencement_PVVIH-dev.yml
- Forum Service: Forum_PVVIH-dev.yml

Convention: {application-name}-{profile}.yml"

# Pousser vers GitHub
git push origin main
```

---

## Option 3: Via l'Interface Web GitHub

Si vous préférez utiliser l'interface web:

### Pour chaque fichier:

1. Allez sur https://github.com/BabacarNdaoKgl/cloud-config-repo-enda
2. Cliquez sur le fichier à renommer (ex: `application_getway.yaml`)
3. Cliquez sur l'icône **crayon** (Edit this file)
4. En haut, changez le nom du fichier:
   - `application_getway.yaml` → `GETWAY_PVVIH-dev.yml`
5. Scrollez en bas et cliquez sur **Commit changes**
6. Répétez pour chaque fichier

---

## Tableau de Correspondance des Noms

| Nom Actuel Possible | Nouveau Nom Requis | Service |
|---------------------|-------------------|---------|
| `application_getway.yaml` | `GETWAY_PVVIH-dev.yml` | Gateway |
| `gateway.yaml` | `GETWAY_PVVIH-dev.yml` | Gateway |
| `getway.yml` | `GETWAY_PVVIH-dev.yml` | Gateway |
| `user.yaml` | `User_API_PVVIH-dev.yml` | User Service |
| `gestion_user.yml` | `User_API_PVVIH-dev.yml` | User Service |
| `user-api.yaml` | `User_API_PVVIH-dev.yml` | User Service |
| `patient.yaml` | `Patient_API_PVVIH-dev.yml` | Patient Service |
| `gestion_patient.yml` | `Patient_API_PVVIH-dev.yml` | Patient Service |
| `patient-api.yaml` | `Patient_API_PVVIH-dev.yml` | Patient Service |
| `reference.yaml` | `referencement_PVVIH-dev.yml` | Reference Service |
| `gestion_reference.yml` | `referencement_PVVIH-dev.yml` | Reference Service |
| `referencement.yaml` | `referencement_PVVIH-dev.yml` | Reference Service |
| `forum.yaml` | `Forum_PVVIH-dev.yml` | Forum Service |
| `forum-pvvih.yml` | `Forum_PVVIH-dev.yml` | Forum Service |

---

## Structure Finale Attendue

Après le renommage, votre dépôt devrait contenir:

```
cloud-config-repo-enda/
├── application.yml                    # Configuration commune (optionnel)
├── GETWAY_PVVIH-dev.yml              # Gateway - Dev
├── GETWAY_PVVIH-prod.yml             # Gateway - Prod (à créer)
├── User_API_PVVIH-dev.yml            # User Service - Dev
├── User_API_PVVIH-prod.yml           # User Service - Prod (à créer)
├── Patient_API_PVVIH-dev.yml         # Patient Service - Dev
├── Patient_API_PVVIH-prod.yml        # Patient Service - Prod (à créer)
├── referencement_PVVIH-dev.yml       # Reference Service - Dev
├── referencement_PVVIH-prod.yml      # Reference Service - Prod (à créer)
├── Forum_PVVIH-dev.yml               # Forum Service - Dev
├── Forum_PVVIH-prod.yml              # Forum Service - Prod (à créer)
└── README.md                          # Documentation (optionnel)
```

---

## Vérification

### 1. Vérifier que les fichiers sont sur GitHub

```powershell
# Ouvrir le dépôt dans le navigateur
start https://github.com/BabacarNdaoKgl/cloud-config-repo-enda
```

### 2. Tester l'accès depuis le Config Server

```powershell
# Attendre que le Config Server redémarre (si nécessaire)
docker-compose restart api-configuration

# Attendre 30 secondes
Start-Sleep -Seconds 30

# Tester chaque configuration
curl http://localhost:8888/GETWAY_PVVIH/dev
curl http://localhost:8888/User_API_PVVIH/dev
curl http://localhost:8888/Patient_API_PVVIH/dev
curl http://localhost:8888/referencement_PVVIH/dev
curl http://localhost:8888/Forum_PVVIH/dev
```

### 3. Vérifier les logs des microservices

```powershell
# Vérifier que les services trouvent leur configuration
docker logs gateway-pvvih | Select-String "Located property source"
docker logs gestion-user | Select-String "Located property source"
docker logs gestion-patient | Select-String "Located property source"
docker logs gestion-reference | Select-String "Located property source"
docker logs forum-pvvih | Select-String "Located property source"
```

---

## Correspondance Nom d'Application ↔ Nom de Fichier

Le nom dans `spring.application.name` doit correspondre au nom du fichier:

| Fichier de Config | spring.application.name | Service |
|-------------------|------------------------|---------|
| `GETWAY_PVVIH-dev.yml` | `GETWAY_PVVIH` | Gateway |
| `User_API_PVVIH-dev.yml` | `User_API_PVVIH` | gestion_user |
| `Patient_API_PVVIH-dev.yml` | `Patient_API_PVVIH` | gestion_patient |
| `referencement_PVVIH-dev.yml` | `referencement_PVVIH` | gestion_reference |
| `Forum_PVVIH-dev.yml` | `Forum_PVVIH` | Forum_PVVIH |

---

## Dépannage

### Erreur: "Could not locate PropertySource"

**Cause:** Le nom du fichier ne correspond pas au nom de l'application

**Solution:**
1. Vérifier `spring.application.name` dans `application.properties` ou `bootstrap.properties`
2. Vérifier que le fichier dans GitHub a exactement le même nom
3. Respecter la casse (majuscules/minuscules)

### Erreur: "fatal: pathspec 'xxx' did not match any files"

**Cause:** Le fichier n'existe pas avec ce nom

**Solution:**
```powershell
# Lister tous les fichiers
dir

# Trouver le bon nom
dir *.yml
dir *.yaml

# Utiliser le nom exact
git mv nom-exact-du-fichier.yaml NOUVEAU_NOM-dev.yml
```

### Le Config Server ne voit pas les changements

**Solution:**
```powershell
# Redémarrer le Config Server pour forcer le refresh
docker-compose restart api-configuration

# Attendre 30 secondes
Start-Sleep -Seconds 30

# Tester à nouveau
curl http://localhost:8888/GETWAY_PVVIH/dev
```

---

## Commandes Utiles

```powershell
# Voir l'historique des commits
git log --oneline

# Voir les fichiers suivis par Git
git ls-files

# Annuler le dernier commit (si erreur)
git reset --soft HEAD~1

# Forcer le push (si conflit)
git push origin main --force

# Voir les différences
git diff

# Voir le statut
git status
```

---

## Après le Renommage

1. **Reconstruire les images Docker:**
   ```powershell
   docker-compose build
   ```

2. **Redémarrer tous les services:**
   ```powershell
   docker-compose down
   docker-compose up -d
   ```

3. **Vérifier les logs:**
   ```powershell
   docker-compose logs -f
   ```

4. **Vérifier Eureka:**
   ```
   http://localhost:8761
   ```

---

## Ressources

- **Dépôt GitHub:** https://github.com/BabacarNdaoKgl/cloud-config-repo-enda.git
- **Documentation Spring Cloud Config:** https://spring.io/projects/spring-cloud-config
- **Script automatique:** `rename-config-files.ps1`
- **Guide complet:** `CLOUD_CONFIG_MIGRATION_GUIDE.md`
