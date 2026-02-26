# 🔧 Étapes de Correction Finale

## Problème Actuel
Les services échouent toujours avec les mêmes erreurs car les configurations dans GitHub ne sont pas encore corrigées.

## ✅ Solution : Corriger et Pousser les Configurations

### Étape 1 : Exécuter le Script de Correction

```powershell
.\fix-critical-configs.ps1
```

Ce script va automatiquement :
- Ajouter `http://` dans `Forum_API_PVVIH-dev.properties`
- Supprimer `spring.cloud.config.enabled: false` dans `GETWAY_PVVIH-dev.yaml`
- Afficher le statut des modifications

### Étape 2 : Vérifier les Modifications

Le script affichera les fichiers modifiés. Vérifiez qu'il montre :
```
M Forum_API_PVVIH-dev.properties
M GETWAY_PVVIH-dev.yaml
```

### Étape 3 : Pousser vers GitHub

```powershell
cd C:\Users\babac\cloud-config-repo\cloud-config-repo-enda
git add .
git commit -m "Fix: Ajout http:// dans gestion.user.url et suppression config.enabled"
git push origin main
```

### Étape 4 : Redémarrer les Services

```powershell
# Revenir au projet
cd "C:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder"

# Redémarrer le Config Server pour recharger depuis GitHub
docker-compose restart api-configuration

# Attendre 15 secondes
Start-Sleep -Seconds 15

# Redémarrer les services qui ont des erreurs
docker-compose restart forum-pvvih gestion-user gestion-patient gateway-pvvih
```

### Étape 5 : Vérifier les Logs

```powershell
docker-compose logs -f forum-pvvih gestion-user gestion-patient
```

## ✅ Signes de Succès

Vous devriez voir dans les logs :

### Config Server :
```
Cloning repository...
Successfully cloned repository
```

### Forum Service :
```
Located environment: name=Forum_API_PVVIH, profiles=[dev]
Tomcat started on port(s): 8080
```

### User Service :
```
Located environment: name=User_API_PVVIH, profiles=[dev]
Tomcat started on port(s): 8080
```

### Patient Service :
```
Located environment: name=Patient_API_PVVIH, profiles=[dev]
Tomcat started on port(s): 8080
```

## ❌ Plus d'Erreurs Comme :
```
Could not resolve placeholder 'app.jwt.secret'
Could not resolve placeholder 'gestion.user.url'
```

---

## 📝 Note Importante

**NON, vous n'avez PAS besoin de supprimer les conteneurs !**

Un simple `restart` suffit car :
- Vous ne modifiez pas les Dockerfiles
- Vous ne modifiez pas les dépendances
- Vous modifiez SEULEMENT les configurations externes (GitHub)

Le `restart` force les services à :
1. Se reconnecter au Config Server
2. Recharger les configurations depuis GitHub
3. Redémarrer avec les nouvelles valeurs

---

## 🚀 Commande Rapide (Tout en Une)

Si vous voulez tout faire d'un coup après avoir exécuté le script de correction :

```powershell
# 1. Corriger les configs
.\fix-critical-configs.ps1

# 2. Aller dans le dépôt Git
cd C:\Users\babac\cloud-config-repo\cloud-config-repo-enda

# 3. Commiter et pousser
git add . ; git commit -m "Fix: Ajout http:// et suppression config.enabled" ; git push origin main

# 4. Revenir au projet
cd "C:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder"

# 5. Redémarrer les services
docker-compose restart api-configuration ; Start-Sleep -Seconds 15 ; docker-compose restart forum-pvvih gestion-user gestion-patient gateway-pvvih

# 6. Voir les logs
docker-compose logs -f
```
