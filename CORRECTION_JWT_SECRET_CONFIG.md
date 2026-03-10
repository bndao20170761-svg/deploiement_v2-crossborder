# Correction JWT_SECRET - Spring Cloud Config

## Problème
Les services `gestion-user` et `gestion-reference` ne trouvent pas `app.jwt.secret` car ils récupèrent leur configuration depuis Spring Cloud Config Server (`api-configuration`).

## Erreur
```
Could not resolve placeholder 'app.jwt.secret' in value "${app.jwt.secret}"
```

## Solution

### Option 1: Ajouter dans les fichiers de configuration centralisés (RECOMMANDÉ)

Les fichiers de configuration doivent être dans `api_configuration/demo/src/main/resources/config/` ou dans un repository Git externe.

Ajoutez dans chaque fichier de configuration:

**User_API_PVVIH.properties** (ou .yml):
```properties
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000
```

**Reference_API_PVVIH.properties** (ou .yml):
```properties
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000
```

**Patient_PVVIH.properties** (ou .yml):
```properties
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000
```

**Forum_PVVIH.properties** (ou .yml):
```properties
app.jwt.secret=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
app.jwt.expiration=3600000
```

### Option 2: Passer via variables d'environnement Docker

Modifier `docker-compose.yml` pour passer `app.jwt.secret` directement:

```yaml
gestion-user:
  environment:
    - APP_JWT_SECRET=${JWT_SECRET}
    - APP_JWT_EXPIRATION=3600000

gestion-reference:
  environment:
    - APP_JWT_SECRET=${JWT_SECRET}
    - APP_JWT_EXPIRATION=3600000
```

Puis dans le `.env`:
```
JWT_SECRET=hF9IsSdyj/KnkZiAJsAnwKsf4rJombf3MAX4pZFBzql8WQyPFy8gVSGxUyTaT3m4gE9yG+i1KGz5BpP5k8+jgg==
```

### Option 3: Désactiver Spring Cloud Config temporairement

Dans `application.properties` de chaque service, ajoutez:
```properties
spring.cloud.config.enabled=false
```

## Étapes à suivre

1. **Vérifier où sont les fichiers de configuration**:
   ```bash
   ls -la api_configuration/demo/src/main/resources/
   ```

2. **Ajouter JWT_SECRET dans les fichiers de config**

3. **Pousser sur GitHub**:
   ```bash
   git add .
   git commit -m "fix: ajout JWT_SECRET dans Spring Cloud Config"
   git push origin main
   ```

4. **Sur la VM, mettre à jour et rebuild**:
   ```bash
   cd ~/deploiement_v2-crossborder
   git pull origin main
   docker-compose build api-configuration gestion-user gestion-reference
   docker-compose restart api-configuration
   sleep 10
   docker-compose restart gestion-user gestion-reference
   ```

## Vérification

```bash
docker-compose logs -f gestion-user gestion-reference
```

Cherchez "Started" dans les logs pour confirmer le démarrage réussi.
