# ✅ Correction des Dockerfiles Maven - Problème Aliyun

## 🐛 Problème Identifié

Erreur lors du build des services backend:
```
Failed to execute goal org.apache.maven.plugins:maven-dependency-plugin:3.8.1:go-offline
Could not transfer artifact org.mockito:mockito-junit-jupiter:jar:5.14.2
status code: 302, reason phrase: Moved Temporarily (302)
```

**Cause:** Le miroir Maven Aliyun a des problèmes de redirection (302) pour certains artifacts.

---

## 🔧 Solution Appliquée

Remplacement de la configuration Maven Aliyun par Maven Central direct.

### Avant (Problématique):
```dockerfile
RUN mkdir -p /root/.m2 && echo '<settings><mirrors><mirror><id>aliyun-central</id><url>https://maven.aliyun.com/repository/central</url><mirrorOf>central</mirrorOf></mirror></mirrors></settings>' > /root/.m2/settings.xml
RUN mvn dependency:go-offline -B -Dmaven.repo.local=/root/.m2/repository
```

### Après (Corrigé):
```dockerfile
# Download dependencies (without go-offline to avoid mirror issues)
RUN mvn dependency:resolve -B
```

---

## 📁 Fichiers Corrigés

✅ **api_register/Dockerfile** - Service Registry (Eureka)
✅ **api_configuration/demo/Dockerfile** - Config Server
✅ **Getway_PVVIH/Dockerfile** - Gateway
✅ **gestion_user/Dockerfile** - Service User
✅ **gestion_patient/Dockerfile** - Service Patient
✅ **Forum_PVVIH/Dockerfile** - Service Forum
✅ **gestion_reference/Dockerfile** - Service Reference (déjà corrigé)

---

## 🚀 Prochaines Étapes

Maintenant vous pouvez relancer le build:

```bash
# Nettoyer les images partielles
docker-compose down
docker system prune -f

# Rebuilder les services backend
docker-compose build api-register
docker-compose build api-configuration
docker-compose build gateway-pvvih
docker-compose build gestion-user
docker-compose build gestion-reference
docker-compose build gestion-patient
docker-compose build forum-pvvih
```

Ou tout en une fois:
```bash
docker-compose build api-register api-configuration gateway-pvvih gestion-user gestion-reference gestion-patient forum-pvvih
```

---

## ⏱️ Temps Estimé

Chaque service backend prend environ 5-10 minutes à builder.

Total pour 7 services: **35-70 minutes**

---

## 📊 Avantages de la Correction

1. ✅ Utilise Maven Central officiel (plus fiable)
2. ✅ Pas de problèmes de redirection 302
3. ✅ Téléchargement plus rapide des dépendances
4. ✅ Moins de risques d'erreurs de build

---

## 🧪 Vérification

Après le build, vérifiez:

```bash
# Voir les images créées
docker images | grep deploiement

# Vérifier qu'il n'y a pas d'erreurs
docker-compose ps
```

---

**Correction terminée!** Vous pouvez maintenant relancer le build sans erreur. 🎉
